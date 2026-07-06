# Password Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add password management to Coderunner — staff self-service change-password (teacher/developer/admin) and teacher-initiated reset of their own students' passwords — while removing student self-service.

**Architecture:** Two backend Express routes reusing existing shared crypto/validation (`hashPassword`, `comparePassword`, `validate`, `passwordSchema`). Frontend: one reusable `ChangePasswordCard` dropped into a new `/settings` page in each of the three staff portals, plus a `ResetPasswordDialog` on the teacher's student-detail page mirroring the existing `ResetProgressDialog`. The student "Account (coming soon)" card is deleted.

**Tech Stack:** Express + Mongoose (backend), Next.js 14 App Router + React + Tailwind + lucide-react (frontend). TypeScript throughout.

## Global Constraints

- **Verifier is `tsc`** — there is no unit-test framework. Backend: `cd Coderunner-Backend/apps/api && npm run typecheck` (`tsc --noEmit`). Frontend: `cd Coderunner-Frontend/web && npx tsc --noEmit` (fast) and `cd Coderunner-Frontend && npm run build` (authoritative, run once at the end).
- **Password policy (single source `passwordSchema`):** 8–100 chars, must contain an uppercase letter, a lowercase letter, and a digit.
- **Never log** any password value or hash (backend routes).
- **No shared rebuild needed** — every shared symbol used is already exported and built.
- **No interpolated Tailwind color classes.** Static arbitrary values like `text-[#76B900]` are fine (already used across the codebase); `bg-${x}-500` is not.
- **Accent color:** `#76B900` (the dashboard green).
- **Auth model:** localStorage `authToken` + `Authorization: Bearer` (the api-client sets it automatically). JWTs are stateless — password change does NOT invalidate other sessions (documented non-goal).
- **Judge Panel** must pass before the final commit (touches `apps/` and `web/src`).

---

### Task 1: Backend — `PUT /auth/password` (staff self-service change)

**Files:**
- Modify: `Coderunner-Backend/apps/api/src/routes/auth.routes.ts` (insert route before `export default router;` at line 319)

**Interfaces:**
- Consumes (all already imported at the top of this file): `Models`, `comparePassword`, `hashPassword`, `validate`, `passwordSchema` from `@code-runner/shared`; `authMiddleware` from `../middleware/auth.middleware`; `authLimiter` from `../middleware/rateLimit.middleware`.
- Produces: `PUT /auth/password` accepting `{ currentPassword, newPassword }`, returning `{ message }`.

- [ ] **Step 1: Add the route.** Insert immediately before the final `export default router;` line:

```ts
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
```

- [ ] **Step 2: Type-check.**

Run: `cd Coderunner-Backend/apps/api && npm run typecheck`
Expected: no errors (exit 0).

- [ ] **Step 3: Commit.**

```bash
git add Coderunner-Backend/apps/api/src/routes/auth.routes.ts
git commit -m "feat(auth): PUT /auth/password self-service change"
```

---

### Task 2: Backend — `POST /teacher/students/:id/password` (teacher resets a student)

**Files:**
- Modify: `Coderunner-Backend/apps/api/src/routes/teacher.routes.ts` (import line 3; insert route before `export default router;` at line 432)

**Interfaces:**
- Consumes: existing `myStudent(req, id)` helper (returns a lean student doc that the teacher owns, or `null`); existing module-level `logger`; `Models` (already imported). Adds `hashPassword`, `validate`, `passwordSchema` to the shared import.
- Produces: `POST /teacher/students/:id/password` accepting `{ newPassword }`, returning `{ message }`.

- [ ] **Step 1: Extend the shared import.** Change line 3 from:

```ts
import { Models, getLogger } from '@code-runner/shared';
```

to:

```ts
import { Models, getLogger, hashPassword, validate, passwordSchema } from '@code-runner/shared';
```

- [ ] **Step 2: Add the route.** Insert immediately before the final `export default router;` line:

```ts
/**
 * POST /teacher/students/:id/password — set a new password for a student in one
 * of my classrooms. Ownership-checked via myStudent (must be role student AND in
 * a classroom I teach). No current password: the teacher is the authority (same
 * posture as the progress reset). The new value is never logged.
 */
router.post('/students/:id/password', async (req: Request, res: Response) => {
  try {
    const student = await myStudent(req, req.params.id);
    if (!student) return res.status(403).json({ error: 'Forbidden', message: 'Student is not in your classroom' });

    const { newPassword } = req.body;
    if (!newPassword || typeof newPassword !== 'string') {
      return res.status(400).json({ error: 'Validation Error', message: 'newPassword is required' });
    }
    const validation = validate(passwordSchema, newPassword);
    if (!validation.success) {
      return res.status(400).json({ error: 'Validation Error', message: validation.errors?.[0] || 'Invalid password' });
    }

    const passwordHash = await hashPassword(newPassword);
    await Models.User.findByIdAndUpdate(student._id, { passwordHash });

    logger.info('Teacher reset student password', { teacherId: req.user!.userId, studentId: String(student._id) });
    res.json({ message: 'Password reset' });
  } catch (error) {
    logger.error('Error resetting student password', { error });
    res.status(500).json({ error: 'Failed to reset password' });
  }
});
```

- [ ] **Step 3: Type-check.**

Run: `cd Coderunner-Backend/apps/api && npm run typecheck`
Expected: no errors (exit 0).

- [ ] **Step 4: Commit.**

```bash
git add Coderunner-Backend/apps/api/src/routes/teacher.routes.ts
git commit -m "feat(teacher): POST /teacher/students/:id/password (ownership-guarded reset)"
```

---

### Task 3: Frontend — API client methods

**Files:**
- Modify: `Coderunner-Frontend/web/src/lib/api-client.ts` (`api.auth` block ~line 174; `api.teacher` block ~line 333)

**Interfaces:**
- Consumes: `apiClient.put`, `apiClient.post` (both exist on the class).
- Produces: `api.auth.changePassword(currentPassword, newPassword)`; `api.teacher.resetStudentPassword(id, { newPassword })`.

- [ ] **Step 1: Add `changePassword` to `api.auth`.** Directly after the `ssoHub:` line (the last entry in `auth`, line 174), add:

```ts
    // Change the current user's own password (staff self-service).
    changePassword: (currentPassword: string, newPassword: string) =>
      apiClient.put('/auth/password', { currentPassword, newPassword }),
```

- [ ] **Step 2: Add `resetStudentPassword` to `api.teacher`.** Directly after the `resetStudent:` entry (line 333-334), inside the `teacher` object, add:

```ts
    resetStudentPassword: (id: string, body: { newPassword: string }) =>
      apiClient.post(`/teacher/students/${id}/password`, body),
```

- [ ] **Step 3: Type-check.**

Run: `cd Coderunner-Frontend/web && npx tsc --noEmit`
Expected: no errors (exit 0).

- [ ] **Step 4: Commit.**

```bash
git add Coderunner-Frontend/web/src/lib/api-client.ts
git commit -m "feat(api-client): changePassword + resetStudentPassword methods"
```

---

### Task 4: Frontend — reusable `ChangePasswordCard`

**Files:**
- Create: `Coderunner-Frontend/web/src/components/account/ChangePasswordCard.tsx`

**Interfaces:**
- Consumes: `api.auth.changePassword` (Task 3).
- Produces: `export function ChangePasswordCard()` — a self-contained card, no props.

- [ ] **Step 1: Create the component.** Write the full file:

```tsx
'use client';

import { useState } from 'react';
import { api } from '@/lib/api-client';
import { Eye, EyeOff, Loader2, KeyRound } from 'lucide-react';

const ACCENT = '#76B900';

// Mirrors the server passwordSchema (8–100 chars, upper + lower + digit) for
// instant feedback only — the API remains the real gate.
function passwordIssue(pw: string): string | null {
  if (pw.length < 8) return 'At least 8 characters';
  if (pw.length > 100) return 'At most 100 characters';
  if (!/[a-z]/.test(pw)) return 'Include a lowercase letter';
  if (!/[A-Z]/.test(pw)) return 'Include an uppercase letter';
  if (!/\d/.test(pw)) return 'Include a number';
  return null;
}

export function ChangePasswordCard() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const issue = next ? passwordIssue(next) : null;
  const mismatch = confirm.length > 0 && next !== confirm;
  const sameAsCurrent = next.length > 0 && next === current;
  const canSubmit =
    !busy && current.length > 0 && next.length > 0 && confirm.length > 0 &&
    !issue && !mismatch && !sameAsCurrent;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    setSuccess(false);
    try {
      await api.auth.changePassword(current, next);
      setSuccess(true);
      setCurrent(''); setNext(''); setConfirm('');
    } catch (err: any) {
      setError(err?.message || 'Could not update password. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    'w-full rounded-lg border border-gray-300 px-3 py-2 pr-9 text-sm text-gray-900 focus:border-[#76B900] focus:outline-none';

  return (
    <div className="rounded-xl border-2 border-gray-200 bg-white p-6">
      <div className="mb-1 flex items-center gap-2">
        <KeyRound className="h-4 w-4" style={{ color: ACCENT }} />
        <h3 className="font-orbitron text-sm font-bold uppercase tracking-wider text-gray-700">Change Password</h3>
      </div>
      <p className="mb-4 font-rajdhani text-sm text-gray-500">
        Update the password you use to sign in. You&apos;ll need your current password.
      </p>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Current password</label>
          <input
            type={show ? 'text' : 'password'}
            className={inputCls}
            value={current}
            onChange={(e) => { setCurrent(e.target.value); setSuccess(false); }}
            autoComplete="current-password"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">New password</label>
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              className={inputCls}
              value={next}
              onChange={(e) => { setNext(e.target.value); setSuccess(false); }}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600"
              tabIndex={-1}
              aria-label={show ? 'Hide passwords' : 'Show passwords'}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {issue && <p className="mt-1 text-xs text-amber-600">{issue}</p>}
          {sameAsCurrent && <p className="mt-1 text-xs text-amber-600">Choose a password different from your current one</p>}
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Confirm new password</label>
          <input
            type={show ? 'text' : 'password'}
            className={inputCls}
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setSuccess(false); }}
            autoComplete="new-password"
          />
          {mismatch && <p className="mt-1 text-xs text-rose-600">Passwords don&apos;t match</p>}
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}
        {success && <p className="text-sm font-semibold" style={{ color: ACCENT }}>Password updated.</p>}

        <button
          type="submit"
          disabled={!canSubmit}
          className="flex items-center gap-2 rounded-lg px-4 py-2 font-orbitron text-sm font-bold uppercase tracking-wider text-white transition disabled:opacity-40"
          style={{ backgroundColor: ACCENT }}
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Update Password
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Type-check.**

Run: `cd Coderunner-Frontend/web && npx tsc --noEmit`
Expected: no errors (exit 0).

- [ ] **Step 3: Commit.**

```bash
git add Coderunner-Frontend/web/src/components/account/ChangePasswordCard.tsx
git commit -m "feat(account): reusable ChangePasswordCard"
```

---

### Task 5: Frontend — three staff settings pages + nav entries

**Files:**
- Create: `Coderunner-Frontend/web/src/app/teacher/settings/page.tsx`
- Create: `Coderunner-Frontend/web/src/app/admin/settings/page.tsx`
- Create: `Coderunner-Frontend/web/src/app/oversight/settings/page.tsx`
- Modify: `Coderunner-Frontend/web/src/components/teacher/TeacherShell.tsx` (import line 5; nav items line 38-40)
- Modify: `Coderunner-Frontend/web/src/app/admin/components/adminNav.ts` (import line 5-8; `ADMIN_NAV` add group)
- Modify: `Coderunner-Frontend/web/src/app/oversight/components/oversightNav.ts` (import line 1; `OVERSIGHT_NAV` items)

**Interfaces:**
- Consumes: `ChangePasswordCard` (Task 4). Each portal's layout already supplies `ProtectedRoute` + shell, so pages render content only.
- Produces: routes `/teacher/settings`, `/admin/settings`, `/oversight/settings`, each in its portal sidebar.

- [ ] **Step 1: Teacher settings page.** Create `app/teacher/settings/page.tsx`:

```tsx
import { ChangePasswordCard } from '@/components/account/ChangePasswordCard';

// The /teacher layout gates this subtree to teacher-role accounts and provides
// the shell, so this page only renders content.
export default function TeacherSettingsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <ChangePasswordCard />
    </div>
  );
}
```

- [ ] **Step 2: Developer settings page.** Create `app/admin/settings/page.tsx`:

```tsx
import { ChangePasswordCard } from '@/components/account/ChangePasswordCard';

// The /admin layout gates this subtree to developer-role accounts and provides
// the shell, so this page only renders content.
export default function AdminSettingsPage() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <ChangePasswordCard />
    </div>
  );
}
```

- [ ] **Step 3: Admin (oversight) settings page.** Create `app/oversight/settings/page.tsx`:

```tsx
import { ChangePasswordCard } from '@/components/account/ChangePasswordCard';

// The /oversight layout gates this subtree to admin-role accounts and provides
// the shell, so this page only renders content.
export default function OversightSettingsPage() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <ChangePasswordCard />
    </div>
  );
}
```

- [ ] **Step 4: Teacher nav item.** In `TeacherShell.tsx`, change the import on line 5 from:

```tsx
import { GraduationCap, LayoutGrid, BookOpen, Inbox, Hash } from 'lucide-react';
```

to:

```tsx
import { GraduationCap, LayoutGrid, BookOpen, Inbox, Hash, Settings } from 'lucide-react';
```

Then add a Settings item to the first nav group — change the `items` array (lines 38-40) from:

```tsx
        { href: '/teacher', label: 'My Classrooms', icon: LayoutGrid, exact: true },
        { href: '/teacher/curriculum', label: 'Answer Guide', icon: BookOpen },
        { href: '/teacher/inbox', label: 'Inbox', icon: Inbox },
```

to:

```tsx
        { href: '/teacher', label: 'My Classrooms', icon: LayoutGrid, exact: true },
        { href: '/teacher/curriculum', label: 'Answer Guide', icon: BookOpen },
        { href: '/teacher/inbox', label: 'Inbox', icon: Inbox },
        { href: '/teacher/settings', label: 'Settings', icon: Settings },
```

- [ ] **Step 5: Developer nav item.** In `adminNav.ts`, add `Settings` to the lucide import (lines 5-8) — append it to the icon list:

```ts
import {
  LayoutDashboard, Database, HardDrive, Package, Cpu, ListChecks,
  Network, Activity, Globe, Cloud, AlertTriangle, Ticket, Store, Terminal, Settings,
} from 'lucide-react';
```

Then add a new group at the end of the `ADMIN_NAV` array, immediately before the closing `];`:

```ts
  {
    label: 'Account',
    items: [
      { href: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
```

- [ ] **Step 6: Admin nav item.** In `oversightNav.ts`, change the import on line 1 from:

```ts
import { LayoutGrid, Radar, Activity, ShieldCheck } from 'lucide-react';
```

to:

```ts
import { LayoutGrid, Radar, Activity, ShieldCheck, Settings } from 'lucide-react';
```

Then add a Settings item to the `OVERSIGHT_NAV` group's `items` array (after the Health entry):

```ts
      { href: '/oversight/dashboard', label: 'Groups', icon: LayoutGrid },
      { href: '/oversight/tickets', label: 'Accountability', icon: Radar },
      { href: '/oversight/health', label: 'Health', icon: Activity },
      { href: '/oversight/settings', label: 'Settings', icon: Settings },
```

- [ ] **Step 7: Type-check.**

Run: `cd Coderunner-Frontend/web && npx tsc --noEmit`
Expected: no errors (exit 0).

- [ ] **Step 8: Commit.**

```bash
git add Coderunner-Frontend/web/src/app/teacher/settings/page.tsx \
        Coderunner-Frontend/web/src/app/admin/settings/page.tsx \
        Coderunner-Frontend/web/src/app/oversight/settings/page.tsx \
        Coderunner-Frontend/web/src/components/teacher/TeacherShell.tsx \
        Coderunner-Frontend/web/src/app/admin/components/adminNav.ts \
        Coderunner-Frontend/web/src/app/oversight/components/oversightNav.ts
git commit -m "feat(settings): change-password page in teacher/developer/admin portals"
```

---

### Task 6: Frontend — `ResetPasswordDialog` + teacher trigger

**Files:**
- Create: `Coderunner-Frontend/web/src/components/teacher/ResetPasswordDialog.tsx`
- Modify: `Coderunner-Frontend/web/src/app/teacher/students/[id]/page.tsx` (import line 11; state line 72; button block lines 113-120; dialog render after line 130)

**Interfaces:**
- Consumes: `api.teacher.resetStudentPassword` (Task 3).
- Produces: `export function ResetPasswordDialog({ studentId, studentUsername, onClose })`.

- [ ] **Step 1: Create the dialog.** Write the full file `components/teacher/ResetPasswordDialog.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { api } from '@/lib/api-client';
import { KeyRound, Loader2, X, Eye, EyeOff, Check } from 'lucide-react';

// Mirrors the server passwordSchema for instant feedback; the API is the real gate.
function passwordIssue(pw: string): string | null {
  if (pw.length < 8) return 'At least 8 characters';
  if (pw.length > 100) return 'At most 100 characters';
  if (!/[a-z]/.test(pw)) return 'Include a lowercase letter';
  if (!/[A-Z]/.test(pw)) return 'Include an uppercase letter';
  if (!/\d/.test(pw)) return 'Include a number';
  return null;
}

export function ResetPasswordDialog({
  studentId, studentUsername, onClose,
}: {
  studentId: string;
  studentUsername: string;
  onClose: () => void;
}) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneValue, setDoneValue] = useState<string | null>(null);

  const issue = newPassword ? passwordIssue(newPassword) : null;
  const canSubmit = !busy && !issue && newPassword.length > 0 && confirmText === studentUsername;

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.teacher.resetStudentPassword(studentId, { newPassword });
      setDoneValue(newPassword);
    } catch (e: any) {
      setError(e?.message || 'Reset failed. Please try again.');
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-[#76B900]" />
            <h3 className="font-orbitron text-lg font-bold text-gray-900">Reset Password</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>

        {doneValue ? (
          <>
            <div className="mb-4 flex items-center gap-2 text-sm text-gray-700">
              <Check className="h-5 w-5 text-[#76B900]" />
              <span><span className="font-semibold">{studentUsername}</span>&apos;s password has been reset.</span>
            </div>
            <p className="mb-2 text-sm text-gray-600">Give them this new password — it won&apos;t be shown again:</p>
            <div className="mb-4 break-all rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 font-mono text-sm text-gray-900">
              {doneValue}
            </div>
            <div className="flex justify-end">
              <button onClick={onClose} className="rounded-lg bg-[#76B900] px-4 py-2 text-sm font-semibold text-white hover:opacity-90">Done</button>
            </div>
          </>
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-600">
              Set a new password for <span className="font-semibold">{studentUsername}</span>. Read it to them so they can sign in — there is no email reset.
            </p>

            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">New password</label>
            <div className="relative mb-1">
              <input
                type={show ? 'text' : 'password'}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-9 text-sm"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600" tabIndex={-1}>
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {issue && <p className="mb-2 text-xs text-amber-600">{issue}</p>}

            <label className="mb-1 mt-3 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Type <span className="font-mono text-gray-800">{studentUsername}</span> to confirm
            </label>
            <input
              className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={studentUsername}
            />

            {error && <p className="mb-3 text-sm text-rose-600">{error}</p>}

            <div className="flex justify-end gap-2">
              <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
              <button
                onClick={submit}
                disabled={!canSubmit}
                className="flex items-center gap-2 rounded-lg bg-[#76B900] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Reset Password
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Import the dialog in the student-detail page.** In `app/teacher/students/[id]/page.tsx`, add after line 11 (`import { ResetProgressDialog } ...`):

```tsx
import { ResetPasswordDialog } from '@/components/teacher/ResetPasswordDialog';
```

- [ ] **Step 3: Add dialog state.** After line 72 (`const [resetOpen, setResetOpen] = useState(false);`), add:

```tsx
  const [resetPwOpen, setResetPwOpen] = useState(false);
```

- [ ] **Step 4: Add the "Reset Password" button.** Replace the existing button block (lines 113-120):

```tsx
        {data && (
          <button
            onClick={() => setResetOpen(true)}
            className="ml-auto rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100"
          >
            Reset Progress
          </button>
        )}
```

with:

```tsx
        {data && (
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setResetPwOpen(true)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
            >
              Reset Password
            </button>
            <button
              onClick={() => setResetOpen(true)}
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100"
            >
              Reset Progress
            </button>
          </div>
        )}
```

- [ ] **Step 5: Render the dialog.** Immediately after the existing `ResetProgressDialog` render block (ends at line 130 with `)}`), add:

```tsx
      {resetPwOpen && data && (
        <ResetPasswordDialog
          studentId={id}
          studentUsername={data.username}
          onClose={() => setResetPwOpen(false)}
        />
      )}
```

- [ ] **Step 6: Type-check.**

Run: `cd Coderunner-Frontend/web && npx tsc --noEmit`
Expected: no errors (exit 0).

- [ ] **Step 7: Commit.**

```bash
git add Coderunner-Frontend/web/src/components/teacher/ResetPasswordDialog.tsx \
        Coderunner-Frontend/web/src/app/teacher/students/[id]/page.tsx
git commit -m "feat(teacher): Reset Password dialog on student detail page"
```

---

### Task 7: Frontend — remove student self-service card

**Files:**
- Modify: `Coderunner-Frontend/web/src/app/(auth)/profile/settings/page.tsx` (remove card lines 182-191; remove now-unused `Sparkles` import on line 19)

**Interfaces:**
- Consumes: nothing new.
- Produces: student settings page with no password/account surface.

- [ ] **Step 1: Delete the "Account (coming soon)" card.** Remove this entire block (lines 182-191):

```tsx
              {/* ── Account (coming soon) ──────────────────────── */}
              <div className={cardCls} style={{ ...cardBorder, opacity: 0.55 }}>
                <h3 className="text-sm font-orbitron font-bold text-gray-700 mb-1 tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4" style={{ color: theme.colors.primary }} />
                  ACCOUNT SETTINGS
                </h3>
                <p className="font-rajdhani text-gray-500 text-sm">
                  Coming soon — Email, password, and account management features.
                </p>
              </div>
```

- [ ] **Step 2: Drop the now-unused `Sparkles` import.** In the lucide import (lines 12-20), remove `Sparkles` from the list (it was only used by the deleted card). The list becomes:

```tsx
import {
  Settings,
  Volume2,
  VolumeX,
  Music,
  ChevronLeft,
  User,
} from 'lucide-react';
```

- [ ] **Step 3: Type-check.**

Run: `cd Coderunner-Frontend/web && npx tsc --noEmit`
Expected: no errors (exit 0) — confirms no other reference to `Sparkles`.

- [ ] **Step 4: Commit.**

```bash
git add "Coderunner-Frontend/web/src/app/(auth)/profile/settings/page.tsx"
git commit -m "feat(settings): remove student password/account placeholder card"
```

---

### Task 8: Full verification + Judge Panel

**Files:** none (verification only).

- [ ] **Step 1: Backend full type-check.**

Run: `cd Coderunner-Backend/apps/api && npm run typecheck`
Expected: exit 0.

- [ ] **Step 2: Frontend authoritative build.**

Run: `cd Coderunner-Frontend && npm run build`
Expected: build succeeds; `/teacher/settings`, `/admin/settings`, `/oversight/settings` appear in the route list.

- [ ] **Step 3: Manual smoke (dev servers).** Verify:
  - Student → `/profile/settings`: only Character + Audio cards, no password surface.
  - Teacher → sidebar "Settings" → change own password (wrong current → "Current password is incorrect"; weak new → rule hint; success clears fields).
  - Teacher → a student in their class → "Reset Password" → set new → success panel shows the value.
  - Teacher → attempt a student NOT in their class (direct URL) → 403 (no reset possible).
  - Developer `/admin/settings` and Admin `/oversight/settings` → change own password works.

- [ ] **Step 4: Judge Panel.** Run the judge-panel skill over the diff (touches `apps/` and `web/src`). Resolve any surviving HIGH finding before proceeding.

- [ ] **Step 5: Final commit (only if the panel or manual pass required fixes).**

```bash
git add -A
git commit -m "fix(password): address review findings"
```

---

## Self-Review

**Spec coverage:**
- Students lose self-service → Task 7. ✅
- Teacher resets own students (ownership-guarded, role student, no current pw) → Task 2 + Task 6. ✅
- Staff self-service change (current + new) → Task 1 + Task 4 + Task 5 (all three portals). ✅
- Error contract (400/401/403/404) → Task 1 + Task 2. ✅
- Validation single-source `passwordSchema` (server) mirrored client-side → Tasks 1/2 (server), 4/6 (client). ✅
- Non-goals (no email, no session invalidation, no teacher-recovery) → not implemented, documented in Global Constraints. ✅
- api-client methods → Task 3. ✅
- Verification via tsc + build + Judge Panel → Task 8. ✅

**Placeholder scan:** No TBD/TODO; every code step contains full content. ✅

**Type consistency:** `changePassword(currentPassword, newPassword)` and `resetStudentPassword(id, { newPassword })` are defined in Task 3 and consumed with identical signatures in Tasks 4 and 6. Route bodies (`{ currentPassword, newPassword }`, `{ newPassword }`) match the client calls. `ChangePasswordCard()` (no props) matches its usage in Task 5. `ResetPasswordDialog({ studentId, studentUsername, onClose })` matches its usage in Task 6. ✅
