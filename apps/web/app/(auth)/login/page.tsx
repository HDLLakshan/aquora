import Link from "next/link";

import { LoginForm } from "../../../features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="w-full max-w-md animate-fade-up space-y-5 motion-reduce:animate-none">
      <div className="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-xl shadow-sky-100/70 backdrop-blur">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-sky-600">Welcome back</p>
          <h1 className="font-display text-3xl font-semibold text-slate-900">
            Sign in to Aquora
          </h1>
          <p className="text-sm text-slate-500">
            Review usage, approve invoices, and keep your districts aligned.
          </p>
        </div>

        <div className="mt-6">
          <LoginForm />
        </div>

        <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
          <span>Need help signing in?</span>
          <a className="font-semibold text-sky-600 hover:text-sky-700" href="mailto:support@aquora.app">
            Contact support
          </a>
        </div>
      </div>

      <p className="text-center text-xs text-slate-500">
        New to Aquora?{" "}
        <Link className="font-semibold text-sky-600 hover:text-sky-700" href="/register">
          Create an account
        </Link>
      </p>
    </div>
  );
}
