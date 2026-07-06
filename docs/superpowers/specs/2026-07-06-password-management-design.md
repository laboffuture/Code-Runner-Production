# Password Management — Design Spec

- **Date:** 2026-07-06
- **Branch:** feat/owner-features
- **Status:** Approved design → ready for implementation plan

## Goal

Give the platform real password management, scoped to a school's operational reality
(there is **no** email / forgot-password recovery flow, and we are not building one):

1. **Students cannot change their own password.** Removing self-service removes the
   entire lockout failure class — a student who self-changes and forgets has no
   recovery path today.
2. **Teachers reset their own students' passwords** from the teacher portal, reusing
   the existing ownership-guarded teacher→student action pattern.
3. **Staff (teacher / developer / admin) can change their own password** via a
   self-service card in their respective portals.
4. **Teacher recovery (a teacher who forgets)** is deferred — it falls to
   admin/developer via a manual/DB path for now. Not built in this spec.

## Roles & policy

| Actor | Own password | Others' passwords |
|-------|--------------|-------------------|
| Student | ❌ no self-service | — |
| Teacher | ✅ self-service (current + new) | ✅ reset **their own students** (no current needed) |
| Developer | ✅ self-service | — (student resets are a teacher action) |
| Admin | ✅ self-service | — |

## Non-goals (explicit)

- ❌ Forgot-password / email reset flow (no mail infrastructure exists).
- ❌ Email notification on password change.
- ❌ "Sign out everywhere on change." JWTs here are stateless with no revocation
   list, so already-issued tokens stay valid until natural expiry (7d). The user's
   current session stays logged in. Documented as a known limitation, not addressed.
- ❌ Teacher-recovery-by-admin (deferred).
- ❌ Admin/developer resetting other staff or arbitrary users' passwords.

## Backend

Both routes reuse existing shared exports already imported elsewhere:
`hashPassword`, `comparePassword`, `validate`, `passwordSchema`. **No shared rebuild
needed for new symbols** — they are all already exported from `@code-runner/shared`.

### 1. `PUT /auth/password` — self-service change (any authenticated user)

- File: `Coderunner-Backend/apps/api/src/routes/auth.routes.ts`
- Middleware: `authMiddleware` + `authLimiter`.
- Body: `{ currentPassword, newPassword }`.
- Flow:
  1. Both present and strings → else `400`.
  2. `findById(req.user.userId).select('+passwordHash')` → `404` if missing.
  3. `comparePassword(currentPassword, user.passwordHash)` → `401`
     "Current password is incorrect" if wrong.
  4. `validate(passwordSchema, newPassword)` → `400` with the schema message if weak.
  5. Reject if `newPassword === currentPassword` → `400`
     "New password must be different from your current password".
  6. `user.passwordHash = await hashPassword(newPassword); await user.save();`
  7. `200 { message: 'Password updated successfully' }`.
- Never logs `currentPassword`, `newPassword`, or the hash.

### 2. `POST /teacher/students/:id/password` — teacher resets a student

- File: `Coderunner-Backend/apps/api/src/routes/teacher.routes.ts`
  (router already `use`s `authMiddleware` + `teacherMiddleware` for the whole file).
- Imports to add on this file: `hashPassword`, `validate`, `passwordSchema`
  from `@code-runner/shared`.
- Flow (mirrors the existing `POST /teacher/students/:id/reset`):
  1. `const student = await myStudent(req, req.params.id)` — the **existing guard**:
     ObjectId valid + `role === 'student'` + student is in a classroom this teacher
     teaches. `403` "Student is not in your classroom" otherwise. This guard is the
     entire authorization story: a teacher can only ever touch their own students,
     never another teacher / admin / developer, never a student they don't own.
  2. Body `{ newPassword }` → `validate(passwordSchema, newPassword)` → `400` if weak.
  3. `await Models.User.findByIdAndUpdate(student._id, { passwordHash: await hashPassword(newPassword) })`.
  4. `logger.info('Teacher reset student password', { teacherId, studentId })`
     (no password value in the log).
  5. `200 { message: 'Password reset' }`.
- No current-password check — the teacher is the authority (same posture as the
  existing progress reset).

## Frontend

### A. Student settings — remove self-service

- File: `Coderunner-Frontend/web/src/app/(auth)/profile/settings/page.tsx`
- Delete the greyed-out "Account Settings — Coming soon" card (lines ~182–191).
  Character + Audio cards remain. Students get no password surface at all.

### B. `ChangePasswordCard` — reusable self-service component (staff)

- New file: `Coderunner-Frontend/web/src/components/account/ChangePasswordCard.tsx`
- Fields: **Current password**, **New password**, **Confirm new password**
  (`type="password"` with a show/hide eye toggle).
- Client pre-checks (mirror server rules for instant feedback; server stays the real
  gate): all filled, `new === confirm`, new meets 8–100 chars + upper + lower + digit,
  new ≠ current.
- Submit → `api.auth.changePassword(current, next)` → loading state, inline success
  ("Password updated"), inline error from server, clears fields on success.
- Styled in the dashboard idiom (white card, neutral, green `#76B900` accent) so it
  fits the staff shells — **not** the student wallpaper theme.

### C. Portal placement of the self-service card (all three staff portals)

Each portal gets a `Settings` nav entry + a settings page that renders
`<ChangePasswordCard />`:

| Portal | Nav config | New nav item | New page |
|--------|-----------|--------------|----------|
| Teacher | `components/teacher/TeacherShell.tsx` groups | "Settings" | `app/teacher/settings/page.tsx` |
| Developer | `app/admin/components/adminNav.ts` (`ADMIN_NAV`) | "Settings" (new "Account" group) | `app/admin/settings/page.tsx` |
| Admin | `app/oversight/components/oversightNav.ts` (`OVERSIGHT_NAV`) | "Settings" | `app/oversight/settings/page.tsx` |

Each settings page sits inside its portal's existing layout (already role-gated by
that portal's `ProtectedRoute`), so no extra auth wiring is needed.

### D. `ResetPasswordDialog` — teacher → student reset

- New file: `Coderunner-Frontend/web/src/components/teacher/ResetPasswordDialog.tsx`
- Mirrors `ResetProgressDialog` (modal, type-username-to-confirm safety gate, busy
  state, inline error).
- Content: a **New password** field (with the same rule checks) + the
  type-`{username}`-to-confirm guard. On submit → `api.teacher.resetStudentPassword(id, { newPassword })`.
- After success: show the teacher the value they set (so they can read it to the
  student) and close.
- Trigger: a **"Reset Password"** button beside the existing "Reset Progress" button
  on `app/teacher/students/[id]/page.tsx` (line ~113–120).

### E. API client additions

- File: `Coderunner-Frontend/web/src/lib/api-client.ts`
  - `api.auth.changePassword(currentPassword, newPassword)` → `PUT /auth/password`.
  - `api.teacher.resetStudentPassword(studentId, { newPassword })` →
    `POST /teacher/students/:id/password`.

## Validation rules (single source: `passwordSchema`)

8–100 characters, and must contain **an uppercase letter, a lowercase letter, and a
digit**. The server is authoritative; the client mirrors these only for UX.

## Error contract

| Case | Status | Message |
|------|--------|---------|
| Missing/blank field | 400 | field-specific |
| Weak new password | 400 | passwordSchema message |
| New == current (self-service) | 400 | "New password must be different…" |
| Wrong current password | 401 | "Current password is incorrect" |
| Teacher not owner / not a student | 403 | "Student is not in your classroom" |
| User not found | 404 | "User not found" |

## Verification

- `tsc` is the authoritative check (per DO_NOT_DISTURB) — build API + shared consumers
  and the web app clean.
- Judge Panel before commit (touches `apps/` and `web/src`).
- Manual: student sees no password card; teacher can change own + reset an owned
  student; teacher cannot reset a non-owned student (403); wrong current password
  rejected; weak/again-same password rejected.

## Build sequence (high level — detailed steps come from the implementation plan)

1. Backend `PUT /auth/password`.
2. Backend `POST /teacher/students/:id/password`.
3. `api-client.ts` methods.
4. `ChangePasswordCard` component.
5. Three staff settings pages + nav entries.
6. `ResetPasswordDialog` + "Reset Password" button on the student detail page.
7. Remove the student "Account (coming soon)" card.
8. `tsc` + Judge Panel.

## Files touched

**Backend**
- `apps/api/src/routes/auth.routes.ts` (add route)
- `apps/api/src/routes/teacher.routes.ts` (add route + imports)

**Frontend**
- `web/src/lib/api-client.ts` (2 methods)
- `web/src/components/account/ChangePasswordCard.tsx` (new)
- `web/src/components/teacher/ResetPasswordDialog.tsx` (new)
- `web/src/app/teacher/settings/page.tsx` (new)
- `web/src/app/admin/settings/page.tsx` (new)
- `web/src/app/oversight/settings/page.tsx` (new)
- `web/src/components/teacher/TeacherShell.tsx` (nav item)
- `web/src/app/admin/components/adminNav.ts` (nav item)
- `web/src/app/oversight/components/oversightNav.ts` (nav item)
- `web/src/app/teacher/students/[id]/page.tsx` ("Reset Password" button)
- `web/src/app/(auth)/profile/settings/page.tsx` (remove card)
