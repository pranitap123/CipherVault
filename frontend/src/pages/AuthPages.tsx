import { useState, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import { Button, Field, useToast } from "../components/ui";

function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: form */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 2 4 6v6c0 5 3.5 7.5 8 10 4.5-2.5 8-5 8-10V6l-8-4Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <span className="text-lg font-semibold tracking-tight">SecureVault</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 mb-6 text-sm text-ink-muted">{subtitle}</p>
          {children}
        </div>
      </div>
      {/* Right: brand panel */}
      <div className="hidden items-center justify-center bg-base-900 p-12 lg:flex">
        <div className="max-w-md">
          <div className="mb-6 inline-flex rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
            AES-256 · encrypted at rest
          </div>
          <p className="text-2xl font-medium leading-snug text-ink">
            Your files are encrypted before they touch disk. Only you hold the keys to read them back.
          </p>
          <p className="mt-4 text-sm text-ink-faint">
            Every upload is sealed server-side. No plaintext ever persists.
          </p>
        </div>
      </div>
    </div>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("demo@securevault.app");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    setLoading(true);
    const err = await login(email, password);
    setLoading(false);
    if (err) setError(err);
    else navigate("/app");
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your vault.">
      <div className="flex flex-col gap-4">
        <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          error={error ?? undefined}
          autoComplete="current-password"
        />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-accent hover:text-accent-hover">
            Forgot password?
          </Link>
        </div>
        <Button onClick={submit} loading={loading}>Sign in</Button>
        <p className="text-center text-sm text-ink-muted">
          New here?{" "}
          <Link to="/register" className="text-accent hover:text-accent-hover">Create an account</Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    setLoading(true);
    const err = await register(name, email, password);
    setLoading(false);
    if (err) setError(err);
    else navigate("/verify-email");
  };

  return (
    <AuthLayout title="Create your vault" subtitle="Start storing files with encryption at rest.">
      <div className="flex flex-col gap-4">
        <Field label="Name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error ?? undefined}
          hint="At least 8 characters."
          autoComplete="new-password"
        />
        <Button onClick={submit} loading={loading}>Create account</Button>
        <p className="text-center text-sm text-ink-muted">
          Already have an account?{" "}
          <Link to="/login" className="text-accent hover:text-accent-hover">Sign in</Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export function ForgotPasswordPage() {
  const { push } = useToast();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    const res = await api.requestPasswordReset(email);
    setLoading(false);
    if (res.ok) setSent(true);
    else push({ kind: "error", text: res.error.message });
  };

  return (
    <AuthLayout title="Reset password" subtitle="We'll email you a reset link.">
      {sent ? (
        <div className="card p-5 text-sm text-ink-muted">
          If an account exists for <span className="text-ink">{email}</span>, a reset link is on its way.
          <div className="mt-4">
            <Link to="/login" className="text-accent hover:text-accent-hover">Back to sign in</Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button onClick={submit} loading={loading}>Send reset link</Button>
          <Link to="/login" className="text-center text-sm text-accent hover:text-accent-hover">Back to sign in</Link>
        </div>
      )}
    </AuthLayout>
  );
}

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { push } = useToast();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    setLoading(true);
    const res = await api.resetPassword(token, password);
    setLoading(false);
    if (res.ok) {
      push({ kind: "ok", text: "Password updated. Sign in with your new password." });
      navigate("/login");
    } else setError(res.error.message);
  };

  return (
    <AuthLayout title="Choose a new password" subtitle="Make it strong and unique.">
      <div className="flex flex-col gap-4">
        {!token && (
          <div className="card border-warn/40 p-3 text-xs text-warn">
            This link is missing its token. Request a new reset email.
          </div>
        )}
        <Field
          label="New password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error ?? undefined}
          hint="At least 8 characters."
        />
        <Button onClick={submit} loading={loading}>Update password</Button>
      </div>
    </AuthLayout>
  );
}

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");
  const [status, setStatus] = useState<"idle" | "verifying" | "done" | "error">("idle");

  const verify = async () => {
    setStatus("verifying");
    const res = await api.verifyEmail(token ?? "demo-token");
    setStatus(res.ok ? "done" : "error");
  };

  return (
    <AuthLayout title="Verify your email" subtitle="Confirm your address to secure your vault.">
      <div className="card p-5 text-sm text-ink-muted">
        {status === "done" ? (
          <>
            <p className="text-ok">Your email is verified.</p>
            <Button className="mt-4" onClick={() => navigate("/app")}>Go to dashboard</Button>
          </>
        ) : status === "error" ? (
          <>
            <p className="text-danger">This verification link is invalid or expired.</p>
            <Button className="mt-4" variant="subtle" onClick={verify}>Resend verification</Button>
          </>
        ) : (
          <>
            <p>We sent a verification link to your inbox. Click it to activate your account.</p>
            <Button className="mt-4" onClick={verify} loading={status === "verifying"}>
              I've clicked the link
            </Button>
          </>
        )}
      </div>
    </AuthLayout>
  );
}

export function SessionExpiredPage() {
  const navigate = useNavigate();
  return (
    <AuthLayout title="Session expired" subtitle="For your security, you've been signed out.">
      <div className="card p-5 text-sm text-ink-muted">
        <p>Your session timed out after a period of inactivity. Sign in again to continue.</p>
        <Button className="mt-4" onClick={() => navigate("/login")}>Sign in again</Button>
      </div>
    </AuthLayout>
  );
}
