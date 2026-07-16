"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent } from "react";
// Client-side helper that calls OUR OWN /api/transatel/* routes (never Transatel directly).
import { fetchSubscriber } from "@/lib/useTransatel";

// ─── CONFIG ──────────────────────────────────────────────────────────────────

// Base URL comes solely from the env var (NEXT_PUBLIC_API_URL). Paths are built inline.
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

// ─── OPTIONS ─────────────────────────────────────────────────────────────────

const titleOptions = ["Mr", "Mrs", "Ms", "Miss", "Dr"];
const packageOptions = ["Everyday 3GB+", "Everyday 5GB+", "Everyday 10GB+", "Unlimited Data"];

type FormState = {
  username: string;
  email: string;
  otp: string;
  simSerial: string;
  title: string;
  lastName: string;
  firstName: string;
  dob: string;
  zoikoPackage: string;
  country: string;
  postcode: string;
  city: string;
  address: string;
};

type Errors = Partial<Record<keyof FormState, string>>;
type Status = "idle" | "submitting" | "success" | "error";
// OTP flow: idle -> sending -> sent -> (verifying) -> verified
type OtpPhase = "idle" | "sending" | "sent" | "verifying" | "verified";

const initialForm: FormState = {
  username: "",
  email: "",
  otp: "",
  simSerial: "",
  title: "Mr",
  lastName: "",
  firstName: "",
  dob: "",
  zoikoPackage: "Everyday 3GB+",
  country: "",
  postcode: "",
  city: "",
  address: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── VALIDATION (mirrors the Django serializer) ────────────────────────────────

function validate(form: FormState): Errors {
  const e: Errors = {};

  if (!form.username.trim()) e.username = "Username is required.";

  if (!form.email.trim()) e.email = "Email is required.";
  else if (!EMAIL_RE.test(form.email.trim())) e.email = "Enter a valid email address.";

  if (!form.otp.trim()) e.otp = "OTP is required.";
  else if (!/^\d{6}$/.test(form.otp.trim())) e.otp = "OTP must be exactly 6 digits.";

  const serialDigits = form.simSerial.replace(/\s+/g, "");
  if (!serialDigits) e.simSerial = "SIM serial number is required.";
  else if (!/^\d{18,22}$/.test(serialDigits)) e.simSerial = "SIM serial (ICCID) must be 18–22 digits.";

  if (!form.lastName.trim()) e.lastName = "Last name is required.";
  if (!form.firstName.trim()) e.firstName = "First name is required.";

  if (!form.dob) {
    e.dob = "Date of birth is required.";
  } else {
    const dob = new Date(form.dob);
    const today = new Date();
    if (dob > today) {
      e.dob = "Date of birth cannot be in the future.";
    } else {
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
      if (age < 18) e.dob = "You must be at least 18 to activate a SIM.";
    }
  }

  if (!form.country.trim()) e.country = "Country is required.";
  if (!form.postcode.trim()) e.postcode = "Postcode is required.";
  if (!form.city.trim()) e.city = "City is required.";
  if (!form.address.trim()) e.address = "Address is required.";

  return e;
}

// ─── FIELD HELPERS ───────────────────────────────────────────────────────────

const inputBase =
  "w-full rounded-md border px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500";

function inputClasses(hasError?: boolean, dashed?: boolean, disabled?: boolean) {
  const state = hasError
    ? "border-red-500 focus:ring-red-500 dark:border-red-500"
    : "border-gray-300 focus:ring-blue-500 dark:border-gray-600";
  const off = disabled ? "opacity-60 cursor-not-allowed" : "";
  return `${inputBase} ${state} ${dashed ? "border-dashed" : ""} ${off}`;
}

type FieldProps = {
  label: string;
  name: keyof FormState;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  dashed?: boolean;
  full?: boolean;
  disabled?: boolean;
};

function Field({ label, name, value, onChange, error, type = "text", placeholder, dashed, full, disabled }: FieldProps) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={inputClasses(Boolean(error), dashed, disabled)}
      />
      {error && (
        <p id={`${name}-error`} className="mt-1 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

type SelectProps = {
  label: string;
  name: keyof FormState;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  error?: string;
  disabled?: boolean;
};

function SelectField({ label, name, value, onChange, options, error, disabled }: SelectProps) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`${inputClasses(Boolean(error), false, disabled)} bg-white dark:bg-gray-800`}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${name}-error`} className="mt-1 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

// ─── COMPONENT ──────────────────────────────────────────────────────────────

export default function Activateform() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const [otpPhase, setOtpPhase] = useState<OtpPhase>("idle");
  const [otpMessage, setOtpMessage] = useState<string | null>(null);

  // Live Transatel ICCID check (hits /api/transatel/subscriber/[serial]).
  type SimCheck = "idle" | "checking" | "found" | "notfound" | "error";
  const [simCheck, setSimCheck] = useState<SimCheck>("idle");
  const [simMsg, setSimMsg] = useState<string | null>(null);

  const otpVerified = otpPhase === "verified";

  // Verify the SIM serial against Transatel when it looks well-formed (13–20 digits).
  const runSimCheck = async (raw: string) => {
    const serial = raw.replace(/\s+/g, "");
    if (!/^\d{13,20}$/.test(serial)) {
      setSimCheck("idle");
      setSimMsg(null);
      return;
    }
    setSimCheck("checking");
    setSimMsg("Checking this SIM with Transatel…");
    try {
      const res = await fetchSubscriber(serial);
      if (res.found) {
        setSimCheck("found");
        setSimMsg("SIM recognised by Transatel.");
      } else if (res.error) {
        setSimCheck("error");
        setSimMsg(res.error);
      } else {
        setSimCheck("notfound");
        setSimMsg("This SIM isn't recognised yet — double-check the number, or it may not be provisioned.");
      }
    } catch {
      setSimCheck("error");
      setSimMsg("Couldn't reach the SIM lookup service. You can still submit.");
    }
  };
  // Every field except email + OTP stays greyed-out until the email is verified.
  const lockRest = !otpVerified;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));

    // If the email changes after a code was sent, reset the whole OTP flow.
    if (name === "email" && otpPhase !== "idle") {
      setOtpPhase("idle");
      setOtpMessage(null);
      setForm((f) => ({ ...f, otp: "" }));
    }

    // Clear a field's error as the user edits it.
    setErrors((prev) => {
      if (!prev[name as keyof FormState]) return prev;
      const next = { ...prev };
      delete next[name as keyof FormState];
      return next;
    });
  };

  // ── Generate / send the code (uses the email above) ──
  const requestOtp = async () => {
    setOtpMessage(null);
    const email = form.email.trim();
    if (!EMAIL_RE.test(email)) {
      setErrors((p) => ({ ...p, email: "Enter a valid email address first." }));
      return;
    }
    setOtpPhase("sending");
    try {
      const res = await fetch(`${API_BASE}/api/otp/request/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        setOtpPhase("sent");
        setOtpMessage((data && data.message) || "A 6-digit code has been sent to your email.");
      } else {
        setOtpPhase("idle");
        setOtpMessage((data && data.detail) || `Could not send code (status ${res.status}).`);
      }
    } catch {
      setOtpPhase("idle");
      setOtpMessage("Could not reach the server. Please try again.");
    }
  };

  // ── Verify the code ──
  const verifyOtp = async () => {
    setOtpMessage(null);
    const otp = form.otp.trim();
    if (!/^\d{6}$/.test(otp)) {
      setErrors((p) => ({ ...p, otp: "OTP must be exactly 6 digits." }));
      return;
    }
    setOtpPhase("verifying");
    try {
      const res = await fetch(`${API_BASE}/api/otp/verify/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim(), otp }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data && data.verified) {
        setOtpPhase("verified");
        setOtpMessage("Email verified — you can now complete the form below.");
        setErrors((p) => ({ ...p, otp: undefined }));
      } else {
        setOtpPhase("sent");
        setOtpMessage((data && data.detail) || "Incorrect code. Please try again.");
      }
    } catch {
      setOtpPhase("sent");
      setOtpMessage("Could not reach the server. Please try again.");
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);

    if (!otpVerified) {
      setServerError("Please verify your email with the OTP before submitting.");
      return;
    }

    const clientErrors = validate(form);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) {
      setStatus("error");
      return;
    }

    setStatus("submitting");

    try {
      const res = await fetch(`${API_BASE}/api/activate/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus("success");
        setForm(initialForm);
        setErrors({});
        setOtpPhase("idle");
        setOtpMessage(null);
        return;
      }

      // Non-2xx: try to read DRF's error body.
      const data = await res.json().catch(() => null);

      if (data && typeof data === "object") {
        const fieldErrors: Errors = {};
        for (const key of Object.keys(data)) {
          if (key in initialForm) {
            const msg = (data as Record<string, unknown>)[key];
            fieldErrors[key as keyof FormState] = Array.isArray(msg) ? String(msg[0]) : String(msg);
          }
        }
        setErrors(fieldErrors);

        if (typeof data.detail === "string") {
          setServerError(data.detail);
        } else if (Object.keys(fieldErrors).length === 0) {
          setServerError("Something went wrong. Please check your details and try again.");
        }
      } else {
        setServerError(`Request failed (status ${res.status}). Please try again.`);
      }

      setStatus("error");
    } catch {
      setServerError("Could not reach the server. Please check your connection and try again.");
      setStatus("error");
    }
  };

  const codeSent = otpPhase === "sent" || otpPhase === "verifying";

  return (
    <section className="bg-white px-4 py-12 sm:px-6 md:px-8 dark:bg-gray-900 dark:text-white ">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-center text-2xl font-bold text-gray-800 dark:text-white">Activate Your SIM</h1>
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          Get started with our services! Enter your email and verify the OTP to unlock the form, then complete your details.
        </p>

        {/* Success banner */}
        {status === "success" && (
          <div className="mt-6 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
            Your SIM activation request has been received. We&rsquo;ll be in touch shortly.
          </div>
        )}

        {/* Top-level error banner */}
        {serverError && (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-6">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
            <Field label="Username:" name="username" value={form.username} onChange={handleChange} error={errors.username} disabled={lockRest} />
            <Field label="Email:" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} disabled={otpVerified} />

            {/* OTP Code + Generate/Verify buttons */}
            <div className="md:col-span-2">
              <label htmlFor="otp" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                OTP Code:
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="otp"
                  name="otp"
                  value={form.otp}
                  onChange={handleChange}
                  placeholder="6-digit code"
                  disabled={otpVerified}
                  aria-invalid={errors.otp ? true : undefined}
                  className={`${inputClasses(Boolean(errors.otp), true, otpVerified)} flex-1`}
                />
                <button
                  type="button"
                  onClick={requestOtp}
                  disabled={otpPhase === "sending" || otpPhase === "verifying" || otpVerified}
                  className="shrink-0 rounded bg-[#1d6fd8] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#175bb5] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {otpPhase === "sending"
                    ? "Sending…"
                    : otpVerified
                    ? "Verified"
                    : codeSent
                    ? "Resend OTP"
                    : "Generate OTP"}
                </button>
                <button
                  type="button"
                  onClick={verifyOtp}
                  disabled={!codeSent || otpPhase === "verifying" || otpVerified}
                  className="shrink-0 rounded bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {otpPhase === "verifying" ? "Verifying…" : "Verify"}
                </button>
              </div>
              {errors.otp && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.otp}</p>}
              {otpMessage && (
                <p className={`mt-2 text-sm ${otpVerified ? "text-green-700 dark:text-green-400" : "text-gray-600 dark:text-gray-400"}`}>
                  {otpMessage}
                </p>
              )}
              {!otpVerified && !otpMessage && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Verify your email to unlock the fields below.
                </p>
              )}
            </div>

            {/* SIM Serial + live Transatel check */}
            <div>
              <label htmlFor="simSerial" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                SIM Serial Number:
              </label>
              <input
                id="simSerial"
                name="simSerial"
                value={form.simSerial}
                onChange={handleChange}
                onBlur={(e) => runSimCheck(e.target.value)}
                disabled={lockRest}
                aria-invalid={errors.simSerial ? true : undefined}
                className={inputClasses(Boolean(errors.simSerial), false, lockRest)}
              />
              {errors.simSerial && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.simSerial}</p>
              )}
              {simMsg && (
                <p
                  className={`mt-1 text-xs ${
                    simCheck === "found"
                      ? "text-green-700 dark:text-green-400"
                      : simCheck === "notfound" || simCheck === "error"
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {simMsg}
                </p>
              )}
            </div>
            <SelectField label="Title:" name="title" value={form.title} onChange={handleChange} options={titleOptions} error={errors.title} disabled={lockRest} />

            <Field label="Last Name:" name="lastName" value={form.lastName} onChange={handleChange} error={errors.lastName} disabled={lockRest} />
            <Field label="First Name:" name="firstName" value={form.firstName} onChange={handleChange} error={errors.firstName} disabled={lockRest} />

            <Field label="Date of Birth:" name="dob" type="date" value={form.dob} onChange={handleChange} error={errors.dob} disabled={lockRest} />
            <SelectField label="Your Zoiko Package:" name="zoikoPackage" value={form.zoikoPackage} onChange={handleChange} options={packageOptions} error={errors.zoikoPackage} disabled={lockRest} />

            <Field label="Country:" name="country" value={form.country} onChange={handleChange} error={errors.country} disabled={lockRest} />
            <Field label="Postcode/Zip code:" name="postcode" value={form.postcode} onChange={handleChange} error={errors.postcode} disabled={lockRest} />

            <Field label="City:" name="city" value={form.city} onChange={handleChange} error={errors.city} disabled={lockRest} />
            <Field label="Address:" name="address" value={form.address} onChange={handleChange} error={errors.address} disabled={lockRest} />
          </div>

          {/* Buttons */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              type="submit"
              disabled={status === "submitting" || !otpVerified}
              className="rounded bg-[#1d6fd8] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#175bb5] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "submitting" ? "Submitting…" : "Submit"}
            </button>
            <Link
              href="/account"
              className="rounded bg-[#1d6fd8] py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#175bb5]"
            >
              Back to My Account
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}