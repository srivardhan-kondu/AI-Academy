import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { userProfiles, users, oauthAccounts } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/session";
import { hasPremium } from "@/lib/permissions";
import { updateProfile, changePassword, deleteAccount } from "@/app/actions/profile";
import { ActionForm, SubmitButton } from "@/components/ui/form";

export const metadata: Metadata = { title: "Account", robots: { index: false } };

export default async function AccountPage() {
  const user = await requireUser("/account");
  const profile = (await db.select().from(userProfiles).where(eq(userProfiles.userId, user.id)))[0];
  const [account] = await db.select({ passwordHash: users.passwordHash }).from(users).where(eq(users.id, user.id));
  const hasPassword = Boolean(account?.passwordHash);
  const googleLinked = (await db.select({ id: oauthAccounts.id }).from(oauthAccounts).where(eq(oauthAccounts.userId, user.id))).length > 0;
  return (
    <div className="container-page max-w-2xl space-y-8 py-10">
      <h1 className="text-3xl font-bold">Account</h1>
      <section className="card p-6">
        <h2 className="text-lg font-semibold">Profile</h2>
        <p className="mt-1 text-sm text-slate-600">{user.email} · {await hasPremium(user) ? "Premium" : "Free"} plan · role: {user.role}</p>
        <ActionForm action={updateProfile} className="mt-4 space-y-4">
          <div>
            <label htmlFor="displayName" className="label">Display name</label>
            <input id="displayName" name="displayName" defaultValue={profile?.displayName} required maxLength={80} className="input" />
          </div>
          <div>
            <label htmlFor="learningGoal" className="label">Learning goal</label>
            <input id="learningGoal" name="learningGoal" defaultValue={profile?.learningGoal ?? ""} maxLength={200} className="input" />
          </div>
          <div>
            <label htmlFor="experienceLevel" className="label">Experience level</label>
            <select id="experienceLevel" name="experienceLevel" defaultValue={profile?.experienceLevel ?? ""} className="input">
              <option value="">Prefer not to say</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <SubmitButton>Save profile</SubmitButton>
        </ActionForm>
      </section>
      <section className="card p-6">
        <h2 className="text-lg font-semibold">{hasPassword ? "Change password" : "Set a password"}</h2>
        <p className="mt-1 text-sm text-slate-600">
          {googleLinked ? "Your account is linked to Google — you can always use “Continue with Google”." : "You sign in with your email and password."}
          {!hasPassword && " Add a password if you also want to sign in with your email."}
        </p>
        <ActionForm action={changePassword} className="mt-4 space-y-4">
          {hasPassword && (
            <div>
              <label htmlFor="current" className="label">Current password</label>
              <input id="current" name="current" type="password" required autoComplete="current-password" className="input" />
            </div>
          )}
          <div>
            <label htmlFor="next" className="label">New password (10+ characters)</label>
            <input id="next" name="next" type="password" required minLength={10} autoComplete="new-password" className="input" />
          </div>
          <SubmitButton>{hasPassword ? "Update password" : "Set password"}</SubmitButton>
        </ActionForm>
      </section>
      <section className="card border-red-200 p-6">
        <h2 className="text-lg font-semibold text-red-800">Delete account</h2>
        <p className="mt-1 text-sm text-slate-600">Permanently deletes your account, profile, progress, quiz attempts, bookmarks and submissions. This cannot be undone.</p>
        <ActionForm action={deleteAccount} className="mt-4 space-y-4">
          {hasPassword && (
            <div>
              <label htmlFor="del-password" className="label">Password</label>
              <input id="del-password" name="password" type="password" required autoComplete="current-password" className="input" />
            </div>
          )}
          <div>
            <label htmlFor="confirm" className="label">Type DELETE to confirm</label>
            <input id="confirm" name="confirm" required className="input" />
          </div>
          <SubmitButton className="btn-danger" pendingText="Deleting…">Delete my account</SubmitButton>
        </ActionForm>
      </section>
    </div>
  );
}
