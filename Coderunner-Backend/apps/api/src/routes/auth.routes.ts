import { Router, Request, Response } from 'express';
import { Models, generateToken, hashPassword, comparePassword, validate, usernameSchema, emailSchema, passwordSchema } from '@code-runner/shared';
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

export default router;
