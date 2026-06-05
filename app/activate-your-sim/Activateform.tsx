"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent } from "react";

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

// ─── FIELD HELPERS ───────────────────────────────────────────────────────────

const inputBase =
  "w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500";

type FieldProps = {
  label: string;
  name: keyof FormState;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  dashed?: boolean;
  full?: boolean;
};

function Field({ label, name, value, onChange, type = "text", placeholder, dashed, full }: FieldProps) {
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
        className={`${inputBase} ${dashed ? "border-dashed" : ""}`}
      />
    </div>
  );
}

type SelectProps = {
  label: string;
  name: keyof FormState;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
};

function SelectField({ label, name, value, onChange, options }: SelectProps) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </label>
      <select id={name} name={name} value={value} onChange={onChange} className={`${inputBase} bg-white dark:bg-gray-800`}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── COMPONENT ──────────────────────────────────────────────────────────────

export default function Activateform() {
  const [form, setForm] = useState<FormState>(initialForm);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: wire up to your activation API
    console.log("Activate SIM form submitted:", form);
  };

  return (
    <section className="bg-white px-4 py-12 sm:px-6 md:px-8 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-center text-2xl font-bold text-gray-800 dark:text-white">Activate Your SIM</h1>
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          Get started with our services! Initiate the activation process for your new SIM card here
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
            <Field label="Username:" name="username" value={form.username} onChange={handleChange} />
            <Field label="Email:" name="email" type="email" value={form.email} onChange={handleChange} />

            <Field label="OTP Code:" name="otp" value={form.otp} onChange={handleChange} dashed full />

            <Field label="SIM Serial Number:" name="simSerial" value={form.simSerial} onChange={handleChange} />
            <SelectField label="Title:" name="title" value={form.title} onChange={handleChange} options={titleOptions} />

            <Field label="Last Name:" name="lastName" value={form.lastName} onChange={handleChange} />
            <Field label="First Name:" name="firstName" value={form.firstName} onChange={handleChange} />

            <Field label="Date of Birth:" name="dob" type="date" value={form.dob} onChange={handleChange} />
            <SelectField label="Your Zoiko Package:" name="zoikoPackage" value={form.zoikoPackage} onChange={handleChange} options={packageOptions} />

            <Field label="Country:" name="country" value={form.country} onChange={handleChange} />
            <Field label="Postcode/Zip code:" name="postcode" value={form.postcode} onChange={handleChange} />

            <Field label="City:" name="city" value={form.city} onChange={handleChange} />
            <Field label="Address:" name="address" value={form.address} onChange={handleChange} />
          </div>

          {/* Buttons */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              type="submit"
              className="rounded bg-[#1d6fd8] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#175bb5]"
            >
              Submit
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