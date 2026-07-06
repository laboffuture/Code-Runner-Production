import { Router, Request, Response } from 'express';
import { Models, generateToken, verifyHubSsoToken, HUB_SSO_NOT_CONFIGURED, hashPassword, comparePassword, validate, usernameSchema, emailSchema, passwordSchema } from '@code-runner/shared';
import { authMiddleware } from '../middleware/auth.middleware';
import { authLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

/**
 * POST /auth/register
 * Register a new user
 */
router.post('/register', authLimiter, async (req: Request, res: Response) => {
  try {
    const { username, email, password, age_group } = req.body;

    // Validate inputs
    const usernameValidation = validate(usernameSchema, username);
    if (!usernameValidation.success) {
      return res.status(400).json({
        error: 'Validation Error',
        message: usernameValidation.errors?.[0] || 'Invalid username',
      });
    }

    const emailValidation = validate(emailSchema, email);
    if (!emailValidation.success) {
      return res.status(400).json({
        error: 'Validation Error',
        message: emailValidation.errors?.[0] || 'Invalid email',
      });
    }

    const passwordValidation = validate(passwordSchema, password);
    if (!passwordValidation.success) {
      return res.status(400).json({
        error: 'Validation Error',
        message: passwordValidation.errors?.[0] || 'Invalid password',
      });
    }

    if (age_group !== '11-14' && age_group !== '15-18') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Age group must be "11-14" or "15-18"',
      });
    }

    // Check if user already exists
    const existingUser = await Models.User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Username or email already exists',
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = new Models.User({
      username,
      email,
      passwordHash,
      age_group,
      role: 'student',
    });

    await user.save();

    // Create the user's progress document up-front so stats/activity/level
    // tracking is robust from the first action (previously this was created
    // lazily on first stats fetch). A failure here must not fail registration —
    // the lazy create-on-read path remains as a fallback.
    try {
      await Models.UserProgress.create({
        userId: user._id,
        stats: {
          totalSolved: 0,
          easySolved: 0,
          mediumSolved: 0,
          hardSolved: 0,
          totalSubmissions: 0,
          acceptedSubmissions: 0,
          acceptanceRate: 0,
        },
        streak: { current: 0, longest: 0, lastSubmissionDate: null },
        experience: 0,
        level: 1,
        contestRating: 1000,
        rank: 'NOVICE',
        achievements: [],
        skills: [],
        recentActivity: [],
        submissionCalendar: [],
        topicProgress: [],
      });
    } catch (progressError) {
      console.error('Failed to create UserProgress at registration (will lazy-create later):', progressError);
    }

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      username: user.username,
      role: user.role,
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        age_group: user.age_group,
        selectedCharacter: user.selectedCharacter || 'astra',
        onboardingComplete: user.onboardingComplete !== undefined ? user.onboardingComplete : false,
      },
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * POST /auth/login
 * Login a user
 */
router.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Username and password are required',
      });
    }

    // Find user — passwordHash is select:false on the model, so opt in here.
    const user = await Models.User.findOne({ username }).select('+passwordHash');

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid username or password',
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid username or password',
      });
    }

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      username: user.username,
      role: user.role,
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        age_group: user.age_group,
        selectedCharacter: user.selectedCharacter || 'astra',
        onboardingComplete: user.onboardingComplete !== undefined ? user.onboardingComplete : false,
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * POST /auth/sso/hub
 * ADMIN-LINK hub single-sign-on. When the hub frames this module's admin page it
 * appends a short-lived (60s) HS256 token signed with the shared HUB_SSO_SECRET.
 * The browser posts that token here; we verify it and, on success, mint a normal
 * Coderunner session for ONE fixed account (HUB_SSO_USERNAME) — so a valid hub
 * token can only ever produce that account's session, never an arbitrary user.
 *
 * Never logs the hub token or the secret. Falls back with 503 (not 401) when SSO
 * isn't configured, so the frontend can quietly show the normal login instead.
 */
router.post('/sso/hub', authLimiter, async (req: Request, res: Response) => {
  try {
    const { hub_token } = req.body;

    if (!hub_token || typeof hub_token !== 'string') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'hub_token is required',
      });
    }

    // Verify the hub token (signature + HS256 + audience + expiry).
    try {
      verifyHubSsoToken(hub_token);
    } catch (err: any) {
      if (err?.message === HUB_SSO_NOT_CONFIGURED) {
        return res.status(503).json({
          error: 'SSO Unavailable',
          message: 'Hub SSO is not configured on this server',
        });
      }
      // Bad signature / wrong audience / expired — do not leak which.
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired hub token',
      });
    }

    // Map to the single configured module account.
    const username = process.env.HUB_SSO_USERNAME || 'owner';
    const user = await Models.User.findOne({ username });

    if (!user) {
      console.error(`Hub SSO: configured account "${username}" not found`);
      return res.status(500).json({
        error: 'Misconfiguration',
        message: 'SSO account not found',
      });
    }

    // Issue a normal Coderunner session — identical shape to /login.
    const token = generateToken({
      userId: user._id.toString(),
      username: user.username,
      role: user.role,
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        age_group: user.age_group,
        selectedCharacter: user.selectedCharacter || 'astra',
        onboardingComplete: user.onboardingComplete !== undefined ? user.onboardingComplete : false,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Error during hub SSO exchange:', error);
    res.status(500).json({ error: 'SSO exchange failed' });
  }
});

/**
 * POST /auth/logout
 * Logout (client-side token removal)
 */
router.post('/logout', (req: Request, res: Response) => {
  // For JWT, logout is handled client-side by removing the token
  // This endpoint is just for consistency
  res.json({ message: 'Logged out successfully' });
});

/**
 * GET /auth/me
 * Get current authenticated user
 * Protected route - requires valid JWT token
 */
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid authentication token',
      });
    }

    // Fetch user from database
    const user = await Models.User.findById(userId).select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      age_group: user.age_group,
      selectedCharacter: user.selectedCharacter || 'astra',
      onboardingComplete: user.onboardingComplete !== undefined ? user.onboardingComplete : false,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

/**
 * PUT /auth/password
 * Change the authenticated user's OWN password. Requires the current password.
 * Any authenticated role may use it (students have no UI path to it). Stateless
 * JWTs mean existing sessions stay valid until natural expiry — documented.
 */
router.put('/password', authMiddleware, authLimiter, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid authentication token' });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || typeof currentPassword !== 'string' ||
        !newPassword || typeof newPassword !== 'string') {
      return res.status(400).json({ error: 'Validation Error', message: 'currentPassword and newPassword are required' });
    }

    // passwordHash is select:false on the model — opt in here.
    const user = await Models.User.findById(userId).select('+passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'Not Found', message: 'User not found' });
    }

    // Verify the current password before allowing any change.
    const ok = await comparePassword(currentPassword, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Current password is incorrect' });
    }

    // Validate the new password against the shared complexity policy.
    const validation = validate(passwordSchema, newPassword);
    if (!validation.success) {
      return res.status(400).json({ error: 'Validation Error', message: validation.errors?.[0] || 'Invalid password' });
    }

    if (newPassword === currentPassword) {
      return res.status(400).json({ error: 'Validation Error', message: 'New password must be different from your current password' });
    }

    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

export default router;
