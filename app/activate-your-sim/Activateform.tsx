"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────

// Set NEXT_PUBLIC_API_URL in .env.local (e.g. http://localhost:8000) for prod.
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const ACTIVATE_ENDPOINT = `${API_BASE}/api/activate/`;

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

// ─── VALIDATION (mirrors the Django serializer) ────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form: FormState): Errors {
  const e: Errors = {};

  if (!form.username.trim()) e.username = "Username is required.";

  if (!form.email.trim()) e.email = "Email is required.";
  else if (!EMAIL_RE.test(form.email.trim())) e.email = "Enter a valid email address.";

  if (!form.otp.trim()) e.otp = "OTP is required.";
  else if (!/^\d{4,8}$/.test(form.otp.trim())) e.otp = "OTP must be 4–8 digits.";

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

function inputClasses(hasError?: boolean, dashed?: boolean) {
  const state = hasError
    ? "border-red-500 focus:ring-red-500 dark:border-red-500"
    : "border-gray-300 focus:ring-blue-500 dark:border-gray-600";
  return `${inputBase} ${state} ${dashed ? "border-dashed" : ""}`;
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
};

function Field({ label, name, value, onChange, error, type = "text", placeholder, dashed, full }: FieldProps) {
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
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={inputClasses(Boolean(error), dashed)}
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
};

function SelectField({ label, name, value, onChange, options, error }: SelectProps) {
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
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`${inputClasses(Boolean(error))} bg-white dark:bg-gray-800`}
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

function Activateform() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    // Clear a field's error as the user edits it.
    setErrors((prev) => {
      if (!prev[name as keyof FormState]) return prev;
      const next = { ...prev };
      delete next[name as keyof FormState];
      return next;
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);

    const clientErrors = validate(form);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) {
      setStatus("error");
      return;
    }

    setStatus("submitting");

    try {
      const res = await fetch(ACTIVATE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus("success");
        setForm(initialForm);
        setErrors({});
        return;
      }

      // Non-2xx: try to read DRF's error body.
      const data = await res.json().catch(() => null);

      if (data && typeof data === "object") {
        const fieldErrors: Errors = {};
        for (const key of Object.keys(data)) {
          if (key in initialForm) {
            const msg = data[key];
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

  return (
    <section className="bg-white px-4 py-12 sm:px-6 md:px-8 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-center text-2xl font-bold text-gray-800 dark:text-white">Activate Your SIM</h1>
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          Get started with our services! Initiate the activation process for your new SIM card here
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
            <Field label="Username:" name="username" value={form.username} onChange={handleChange} error={errors.username} />
            <Field label="Email:" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} />

            <Field label="OTP Code:" name="otp" value={form.otp} onChange={handleChange} error={errors.otp} dashed full />

            <Field label="SIM Serial Number:" name="simSerial" value={form.simSerial} onChange={handleChange} error={errors.simSerial} />
            <SelectField label="Title:" name="title" value={form.title} onChange={handleChange} options={titleOptions} error={errors.title} />

            <Field label="Last Name:" name="lastName" value={form.lastName} onChange={handleChange} error={errors.lastName} />
            <Field label="First Name:" name="firstName" value={form.firstName} onChange={handleChange} error={errors.firstName} />

            <Field label="Date of Birth:" name="dob" type="date" value={form.dob} onChange={handleChange} error={errors.dob} />
            <SelectField label="Your Zoiko Package:" name="zoikoPackage" value={form.zoikoPackage} onChange={handleChange} options={packageOptions} error={errors.zoikoPackage} />

            <Field label="Country:" name="country" value={form.country} onChange={handleChange} error={errors.country} />
            <Field label="Postcode/Zip code:" name="postcode" value={form.postcode} onChange={handleChange} error={errors.postcode} />

            <Field label="City:" name="city" value={form.city} onChange={handleChange} error={errors.city} />
            <Field label="Address:" name="address" value={form.address} onChange={handleChange} error={errors.address} />
          </div>

          {/* Buttons */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              type="submit"
              disabled={status === "submitting"}
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

// Exported both ways so either default or named import works.
export default Activateform;
export { Activateform };