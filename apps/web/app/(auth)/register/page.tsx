import Link from "next/link";

import { RegisterForm } from "../../../features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md animate-fade-up space-y-5 motion-reduce:animate-none">
      <div className="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-xl shadow-sky-100/70 backdrop-blur">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-sky-600">Get started</p>
          <h1 className="font-display text-3xl font-semibold text-slate-900">
            Create your Aquora account
          </h1>
          <p className="text-sm text-slate-500">
            Build a calmer billing experience for every residence you manage.
          </p>
        </div>

        <div className="mt-6">
          <RegisterForm />
        </div>

        <div className="mt-6 rounded-2xl border border-sky-100 bg-sky-50/80 px-4 py-3 text-xs text-slate-600">
          Aquora keeps your billing data encrypted in transit and at rest. You are in control of
          every notification and payment flow.
        </div>
      </div>

      <p className="text-center text-xs text-slate-500">
        Already have access?{" "}
        <Link className="font-semibold text-sky-600 hover:text-sky-700" href="/login">
          Sign in
        </Link>
      </p>
    </div>
  );
}
