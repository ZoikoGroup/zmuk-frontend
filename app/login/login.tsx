"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";

// ─── ICONS ─────────────────────────────────────────────────────────────────

const GoogleG = () => (
  <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5 16.8 35.5 11 29.7 11 22.5S16.8 9.5 24 9.5c3.3 0 6.3 1.2 8.6 3.3l5.7-5.7C34.6 3.6 29.6 1.5 24 1.5 12.4 1.5 3 10.9 3 22.5S12.4 43.5 24 43.5c11 0 20.5-8 20.5-21 0-1.4-.2-2.8-.9-4z" />
    <path fill="#FF3D00" d="M5.3 13.1l6.6 4.8C13.6 13.9 18.4 11 24 11c3.3 0 6.3 1.2 8.6 3.3l5.7-5.7C34.6 5.1 29.6 3 24 3 15.8 3 8.7 7.6 5.3 13.1z" />
    <path fill="#4CAF50" d="M24 45c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.2 36.1 26.7 37 24 37c-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.5 40.4 16.2 45 24 45z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.6l6.3 5.2C41.8 35.7 45 30.4 45 24c0-1.4-.2-2.8-.9-3.5z" />
  </svg>
);
const Eye = () => (<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>);
const EyeOff = () => (<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M3 3l18 18M10.6 10.6a3 3 0 004.2 4.2M9.9 5.2A9.5 9.5 0 0112 5c6.5 0 10 7 10 7a17 17 0 01-3.2 4M6.1 6.1A17 17 0 002 12s3.5 7 10 7a9.6 9.6 0 004-.9" /></svg>);

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const tabs = ["Login", "Register", "Reset Password"] as const;
type Tab = (typeof tabs)[number];

const inputCx =
  "w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:border-[#e6007e] focus:outline-none focus:ring-1 focus:ring-[#e6007e] dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500";
const labelCx = "mb-1.5 block text-sm font-semibold text-[#0e8f74] dark:text-[#34d39e]";

function GoogleButton({ label }: { label: string }) {
  return (
    <button type="button" className="inline-flex items-center overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm dark:border-gray-600">
      <span className="px-3 py-2">
        <GoogleG />
      </span>
      <span className="bg-[#4285F4] px-4 py-2.5 text-sm font-semibold text-white">{label}</span>
    </button>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

function Login() {
  const [tab, setTab] = useState<Tab>("Login");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: wire up to your auth API
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 dark:bg-gray-900">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl lg:grid-cols-2 dark:bg-gray-800">
        {/* ─── Left: image panel ─── */}
        <div className="relative hidden min-h-[560px] lg:block">
          {/* Image slot */}
          <Image src="/images/login/ZM-UK-Login-Image-scaled.webp" alt="Stay connected with Zoiko Mobile" fill sizes="50vw" className="object-cover" />
          {/* Pink overlay */}
    
        </div>

        {/* ─── Right: form panel ─── */}
        <div className="p-8 sm:p-10">
          {/* Logo — image slot */}
          <div className="flex justify-center">
            <span className="relative block h-12 w-40">
              <Image src="/images/logo.png" alt="Zoiko Mobile" fill sizes="160px" className="object-contain" />
            </span>
          </div>

          {/* Tabs */}
          <div className="mt-8 flex gap-6 border-b border-gray-200 dark:border-gray-700">
            {tabs.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`-mb-px border-b-2 pb-2 text-sm font-semibold transition-colors ${
                  tab === t
                    ? "border-[#0e8f74] text-[#0e8f74] dark:border-[#34d39e] dark:text-[#34d39e]"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* ─── Login ─── */}
          {tab === "Login" && (
            <form onSubmit={handleSubmit} className="mt-7">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome back!</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Enter your credentials to access your account.</p>

              <div className="mt-6">
                <label htmlFor="login-id" className={labelCx}>Username or Email Address</label>
                <input id="login-id" type="text" className={inputCx} />
              </div>

              <div className="mt-4">
                <label htmlFor="login-pass" className={labelCx}>Password</label>
                <div className="relative">
                  <input id="login-pass" type={showPassword ? "text" : "password"} className={`${inputCx} pr-10`} />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              <p className="mt-5 text-sm font-medium text-gray-700 dark:text-gray-200">Connect with</p>
              <div className="mt-2">
                <GoogleButton label="Login with Google" />
              </div>

              <label className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-[#e6007e] focus:ring-[#e6007e]" />
                Remember for 30 days
              </label>

              <button type="submit" className="mt-5 w-full rounded-md bg-[#e6007e] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#c4007a]">
                Log In
              </button>

              <p className="mt-5 text-center text-sm font-semibold text-[#0e8f74] dark:text-[#34d39e]">
                <button type="button" onClick={() => setTab("Reset Password")} className="hover:underline">Forgot Password?</button>
                {" | "}
                <button type="button" onClick={() => setTab("Register")} className="hover:underline">Create Account</button>
              </p>
            </form>
          )}

          {/* ─── Register ─── */}
          {tab === "Register" && (
            <form onSubmit={handleSubmit} className="mt-7">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Create your account</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Sign up to get started with Zoiko Mobile.</p>

              <div className="mt-6">
                <label htmlFor="reg-name" className={labelCx}>Full Name</label>
                <input id="reg-name" type="text" className={inputCx} />
              </div>

              <div className="mt-4">
                <label htmlFor="reg-email" className={labelCx}>Email Address</label>
                <input id="reg-email" type="email" className={inputCx} />
              </div>

              <div className="mt-4">
                <label htmlFor="reg-pass" className={labelCx}>Password</label>
                <div className="relative">
                  <input id="reg-pass" type={showPassword ? "text" : "password"} className={`${inputCx} pr-10`} />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              <p className="mt-5 text-sm font-medium text-gray-700 dark:text-gray-200">Connect with</p>
              <div className="mt-2">
                <GoogleButton label="Sign up with Google" />
              </div>

              <button type="submit" className="mt-6 w-full rounded-md bg-[#e6007e] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#c4007a]">
                Create Account
              </button>

              <p className="mt-5 text-center text-sm text-gray-600 dark:text-gray-300">
                Already have an account?{" "}
                <button type="button" onClick={() => setTab("Login")} className="font-semibold text-[#0e8f74] hover:underline dark:text-[#34d39e]">Log in</button>
              </p>
            </form>
          )}

          {/* ─── Reset Password ─── */}
          {tab === "Reset Password" && (
            <form onSubmit={handleSubmit} className="mt-7">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Reset your password</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Enter your email and we&rsquo;ll send you a reset link.</p>

              <div className="mt-6">
                <label htmlFor="reset-email" className={labelCx}>Email Address</label>
                <input id="reset-email" type="email" className={inputCx} />
              </div>

              <button type="submit" className="mt-6 w-full rounded-md bg-[#e6007e] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#c4007a]">
                Send Reset Link
              </button>

              <p className="mt-5 text-center text-sm text-gray-600 dark:text-gray-300">
                Remember your password?{" "}
                <button type="button" onClick={() => setTab("Login")} className="font-semibold text-[#0e8f74] hover:underline dark:text-[#34d39e]">Log in</button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// Exported both ways so either default or named import works.
export default Login;
export { Login };