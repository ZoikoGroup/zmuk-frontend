"use client";

import { useState } from "react";

type FormData = {
    fullName: string;
    dob: string;
    email: string;
    mobile: string;

    institution: string;
    studentId: string;
    enrolmentStatus: string;
    graduationDate: string;

    plan: string;
    contractDuration: string;

    roaming: boolean;
    wifiCalling: boolean;
    esim: boolean;

    studentCard: File | null;

    term1: boolean;
    term2: boolean;
    term3: boolean;
    term4: boolean;
    term5: boolean;

    declaration: boolean;

    signature: string;
    declarationDate: string;
};

type Errors = {
    [key: string]: string;
};
const API_URL = "http://127.0.0.1:8000";

export default function StudentDiscountApplication() {
    const initialFormData: FormData = {
        fullName: "",
        dob: "",
        email: "",
        mobile: "",

        institution: "",
        studentId: "",
        enrolmentStatus: "",
        graduationDate: "",

        plan: "",
        contractDuration: "",

        roaming: false,
        wifiCalling: false,
        esim: false,

        studentCard: null,

        term1: false,
        term2: false,
        term3: false,
        term4: false,
        term5: false,

        declaration: false,

        signature: "",
        declarationDate: "",
    };

    const [formData, setFormData] = useState(initialFormData);
    // const [formData, setFormData] = useState<FormData>({
    //     fullName: "",
    //     dob: "",
    //     email: "",
    //     mobile: "",

    //     institution: "",
    //     studentId: "",
    //     enrolmentStatus: "",
    //     graduationDate: "",

    //     plan: "",
    //     contractDuration: "",

    //     roaming: false,
    //     wifiCalling: false,
    //     esim: false,

    //     studentCard: null,

    //     term1: false,
    //     term2: false,
    //     term3: false,
    //     term4: false,
    //     term5: false,

    //     declaration: false,

    //     signature: "",
    //     declarationDate: "",
    // });

    const [errors, setErrors] = useState<Errors>({});

    const [loading, setLoading] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement
        >
    ) => {
        const { name, value, type } = e.target;

        const checked =
            e.target instanceof HTMLInputElement
                ? e.target.checked
                : false;

        setFormData((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];

        if (!file) return;

        setFormData((prev) => ({
            ...prev,
            studentCard: file,
        }));

        setErrors((prev) => ({
            ...prev,
            studentCard: "",
        }));
    };

    const validate = () => {
        const newErrors: Errors = {};

        // Personal Information
        if (!formData.fullName.trim())
            newErrors.fullName = "Please enter your full name.";

        if (!formData.dob) {
            newErrors.dob = "Please select your date of birth.";
        } else {
            const dob = new Date(formData.dob);
            const today = new Date();

            let age = today.getFullYear() - dob.getFullYear();

            const month = today.getMonth() - dob.getMonth();

            if (
                month < 0 ||
                (month === 0 && today.getDate() < dob.getDate())
            ) {
                age--;
            }

            if (age < 16) {
                newErrors.dob =
                    "Applicant must be at least 16 years old.";
            }
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required.";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        ) {
            newErrors.email =
                "Please enter a valid email address.";
        }

        if (!formData.mobile.trim()) {
            newErrors.mobile = "Mobile number is required.";
        } else if (
            !/^(\+44|0)7\d{9}$/.test(formData.mobile)
        ) {
            newErrors.mobile =
                "Please enter a valid UK mobile number.";
        }

        // Education

        if (!formData.institution.trim())
            newErrors.institution =
                "Institution name is required.";

        if (!formData.studentId.trim())
            newErrors.studentId =
                "Student ID number is required.";

        if (!formData.enrolmentStatus.trim())
            newErrors.enrolmentStatus =
                "Please enter your enrolment status.";

        if (!formData.graduationDate)
            newErrors.graduationDate =
                "Expected graduation date is required.";

        // Plan

        if (!formData.plan)
            newErrors.plan =
                "Please select a plan.";

        if (!formData.contractDuration)
            newErrors.contractDuration =
                "Please select a contract duration.";

        // File

        if (!formData.studentCard) {
            newErrors.studentCard =
                "Please upload your student ID.";
        } else {
            const allowed = [
                "image/jpeg",
                "image/png",
                "application/pdf",
            ];

            if (
                !allowed.includes(formData.studentCard.type)
            ) {
                newErrors.studentCard =
                    "Only JPG, PNG or PDF files are allowed.";
            }

            if (
                formData.studentCard.size >
                5 * 1024 * 1024
            ) {
                newErrors.studentCard =
                    "Maximum file size is 5MB.";
            }
        }

        // Terms

        if (
            !formData.term1 ||
            !formData.term2 ||
            !formData.term3 ||
            !formData.term4 ||
            !formData.term5
        ) {
            newErrors.terms =
                "Please accept all terms and conditions.";
        }

        // Declaration

        if (!formData.declaration) {
            newErrors.declaration =
                "Please accept the declaration.";
        }

        if (!formData.signature.trim()) {
            newErrors.signature =
                "Signature is required.";
        }

        if (!formData.declarationDate) {
            newErrors.declarationDate =
                "Please select today's date.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);

        try {
            const form = new FormData();

            form.append("full_name", formData.fullName);
            form.append("dob", formData.dob);
            form.append("email", formData.email);
            form.append("mobile", formData.mobile);

            form.append("institution", formData.institution);
            form.append("student_id_number", formData.studentId);
            form.append(
                "enrolment_status",
                formData.enrolmentStatus
            );
            form.append(
                "graduation_date",
                formData.graduationDate
            );

            form.append("selected_plan", formData.plan);
            form.append(
                "contract_duration",
                formData.contractDuration
            );

            form.append(
                "roaming",
                String(formData.roaming)
            );

            form.append(
                "wifi_calling",
                String(formData.wifiCalling)
            );

            form.append(
                "esim",
                String(formData.esim)
            );

            form.append(
                "signature",
                formData.signature
            );

            form.append(
                "declaration_date",
                formData.declarationDate
            );

            if (formData.studentCard) {
                form.append(
                    "student_id_document",
                    formData.studentCard
                );
            }

            const response = await fetch(
                `${API_URL}/api/student-discount/`,
                {
                    method: "POST",
                    body: form,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw data;
            }

            alert("Your application has been submitted successfully!");

            setFormData(initialFormData);

            setErrors({});

        } catch (error) {
            if (error && typeof error === "object") {
                console.error(error);

                alert("Please check the form and try again.");
            } else {
                alert("Something went wrong.");
            }
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

    return (
        <>
            <main className="bg-gray-100 dark:bg-zinc-950 py-12 px-4">
                <div className="mx-auto max-w-6xl rounded-xl bg-white dark:bg-zinc-900 shadow-xl overflow-hidden">

                    {/* Header */}

                    <div className="bg-gradient-to-r from-emerald-500 to-cyan-600 py-8 text-center">

                        <h1 className="text-2xl md:text-4xl font-bold text-white">

                            Zoiko Mobile Student Discount Application

                        </h1>

                    </div>

                    <form
                        onSubmit={onSubmit}
                        className="p-6 md:p-10 space-y-14"
                    >

                        {/* PERSONAL */}

                        <section>

                            <h2 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-8">

                                Personal Information

                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                <div>

                                    <label className="font-semibold">

                                        Full Name *

                                    </label>

                                    <input
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className={inputClass}
                                    />

                                    {errors.fullName && (

                                        <p className="mt-1 text-red-500 text-sm">

                                            {errors.fullName}

                                        </p>

                                    )}

                                </div>

                                <div>

                                    <label className="font-semibold">

                                        DOB *

                                    </label>

                                    <input
                                        type="date"
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleChange}
                                        className={inputClass}
                                    />

                                    {errors.dob && (

                                        <p className="mt-1 text-red-500 text-sm">

                                            {errors.dob}

                                        </p>

                                    )}

                                </div>

                                <div>

                                    <label className="font-semibold">

                                        Email *

                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={inputClass}
                                    />

                                    {errors.email && (

                                        <p className="mt-1 text-red-500 text-sm">

                                            {errors.email}

                                        </p>

                                    )}

                                </div>

                                <div>

                                    <label className="font-semibold">

                                        Mobile Number *

                                    </label>

                                    <input
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        className={inputClass}
                                    />

                                    {errors.mobile && (

                                        <p className="mt-1 text-red-500 text-sm">

                                            {errors.mobile}

                                        </p>

                                    )}

                                </div>

                            </div>

                        </section>

                        {/* EDUCATION */}

                        <section>

                            <h2 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-8">

                                Education Details

                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                <div>

                                    <label className="font-semibold">

                                        Name of Educational Institution *

                                    </label>

                                    <input
                                        name="institution"
                                        value={formData.institution}
                                        onChange={handleChange}
                                        className={inputClass}
                                    />

                                    {errors.institution && (

                                        <p className="mt-1 text-red-500 text-sm">

                                            {errors.institution}

                                        </p>

                                    )}

                                </div>

                                <div>

                                    <label className="font-semibold">

                                        Student ID Number *

                                    </label>

                                    <input
                                        name="studentId"
                                        value={formData.studentId}
                                        onChange={handleChange}
                                        className={inputClass}
                                    />

                                    {errors.studentId && (

                                        <p className="mt-1 text-red-500 text-sm">

                                            {errors.studentId}

                                        </p>

                                    )}

                                </div>

                                <div>

                                    <label className="font-semibold">

                                        Enrolment Status *

                                    </label>

                                    <input
                                        name="enrolmentStatus"
                                        value={formData.enrolmentStatus}
                                        onChange={handleChange}
                                        className={inputClass}
                                    />

                                    {errors.enrolmentStatus && (

                                        <p className="mt-1 text-red-500 text-sm">

                                            {errors.enrolmentStatus}

                                        </p>

                                    )}

                                </div>

                                <div>

                                    <label className="font-semibold">

                                        Expected Graduation Date *

                                    </label>

                                    <input
                                        type="date"
                                        name="graduationDate"
                                        value={formData.graduationDate}
                                        onChange={handleChange}
                                        className={inputClass}
                                    />

                                    {errors.graduationDate && (

                                        <p className="mt-1 text-red-500 text-sm">

                                            {errors.graduationDate}

                                        </p>

                                    )}

                                </div>

                            </div>

                        </section>
                        {/* PLAN SELECTION */}

                        <section>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                                {/* LEFT */}

                                <div>

                                    <h2 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-8">

                                        Plan Selection

                                    </h2>

                                    <div className="space-y-6">

                                        <div>

                                            <label className="font-semibold">

                                                Please select the desired Zoiko Mobile monthly plan *

                                            </label>

                                            <select
                                                name="plan"
                                                value={formData.plan}
                                                onChange={handleChange}
                                                className={inputClass}
                                            >
                                                <option value="">
                                                    Select Plan
                                                </option>

                                                <option value="1GB">
                                                    Essence 1GB
                                                </option>

                                                <option value="3GB">
                                                    Everyday+ 3GB
                                                </option>

                                                <option value="10GB">
                                                    Freestyle 10GB
                                                </option>

                                                <option value="Business Booster">
                                                    Business Booster
                                                </option>

                                            </select>

                                            {errors.plan && (
                                                <p className="mt-1 text-sm text-red-500">
                                                    {errors.plan}
                                                </p>
                                            )}

                                        </div>

                                        <div>

                                            <label className="font-semibold block mb-4">

                                                Please indicate if you would like to include any additional features *

                                            </label>

                                            <div className="space-y-3">

                                                <label className="flex items-center gap-3">

                                                    <input
                                                        type="checkbox"
                                                        name="roaming"
                                                        checked={formData.roaming}
                                                        onChange={handleChange}
                                                    />

                                                    <span>

                                                        Roaming Data (if available)

                                                    </span>

                                                </label>

                                                <label className="flex items-center gap-3">

                                                    <input
                                                        type="checkbox"
                                                        name="wifiCalling"
                                                        checked={formData.wifiCalling}
                                                        onChange={handleChange}
                                                    />

                                                    <span>

                                                        WiFi Calling

                                                    </span>

                                                </label>

                                                <label className="flex items-center gap-3">

                                                    <input
                                                        type="checkbox"
                                                        name="esim"
                                                        checked={formData.esim}
                                                        onChange={handleChange}
                                                    />

                                                    <span>

                                                        E-SIM (if available)

                                                    </span>

                                                </label>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                                {/* RIGHT */}

                                <div>

                                    <h2 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-8">

                                        Contract Duration

                                    </h2>

                                    <div className="space-y-6">

                                        <div>

                                            <label className="font-semibold">

                                                Select your preferred contract duration for the selected plan *

                                            </label>

                                            <select
                                                name="contractDuration"
                                                value={formData.contractDuration}
                                                onChange={handleChange}
                                                className={inputClass}
                                            >

                                                <option value="">

                                                    Select Contract Duration

                                                </option>

                                                <option value="12">

                                                    12 Months

                                                </option>

                                                <option value="24">

                                                    24 Months

                                                </option>

                                                <option value="30">

                                                    30 Days

                                                </option>

                                            </select>

                                            {errors.contractDuration && (

                                                <p className="mt-1 text-sm text-red-500">

                                                    {errors.contractDuration}

                                                </p>

                                            )}

                                        </div>

                                        <div>

                                            <label className="font-semibold">

                                                Please upload a scanned or clear photo of your student ID card *

                                            </label>

                                            <input
                                                type="file"
                                                accept=".jpg,.jpeg,.png,.pdf"
                                                onChange={handleFileChange}
                                                className={`${inputClass} file:mr-4 file:rounded-md file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-white hover:file:bg-emerald-700`}
                                            />

                                            {formData.studentCard && (

                                                <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">

                                                    Selected :

                                                    {" "}

                                                    {formData.studentCard.name}

                                                </p>

                                            )}

                                            {errors.studentCard && (

                                                <p className="mt-1 text-sm text-red-500">

                                                    {errors.studentCard}

                                                </p>

                                            )}

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </section>

                        {/* TERMS */}

                        <section>

                            <h2 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-8">

                                Terms and Conditions

                            </h2>

                            <div className="space-y-4">

                                <label className="flex gap-3 items-start">

                                    <input
                                        type="checkbox"
                                        name="term1"
                                        checked={formData.term1}
                                        onChange={handleChange}
                                    />

                                    <span>

                                        The student discount is available only to registered students aged 16 or over at recognised educational institutions in the UK.

                                    </span>

                                </label>

                                <label className="flex gap-3 items-start">

                                    <input
                                        type="checkbox"
                                        name="term2"
                                        checked={formData.term2}
                                        onChange={handleChange}
                                    />

                                    <span>

                                        I hereby declare that the information provided in this form is accurate and complete to the best of my knowledge.

                                    </span>

                                </label>

                                <label className="flex gap-3 items-start">

                                    <input
                                        type="checkbox"
                                        name="term3"
                                        checked={formData.term3}
                                        onChange={handleChange}
                                    />

                                    <span>

                                        The discount is applicable to the specified monthly plans and contract durations.

                                    </span>

                                </label>

                                <label className="flex gap-3 items-start">

                                    <input
                                        type="checkbox"
                                        name="term4"
                                        checked={formData.term4}
                                        onChange={handleChange}
                                    />

                                    <span>

                                        I will provide valid proof of enrolment or a student ID when requested.

                                    </span>

                                </label>

                                <label className="flex gap-3 items-start">

                                    <input
                                        type="checkbox"
                                        name="term5"
                                        checked={formData.term5}
                                        onChange={handleChange}
                                    />

                                    <span>

                                        The discount will be applied for the duration of the selected contract.

                                    </span>

                                </label>

                            </div>

                            {errors.terms && (

                                <p className="mt-3 text-red-500">

                                    {errors.terms}

                                </p>

                            )}

                        </section>
                        {/* Declaration */}

                        <section>

                            <h2 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-8">

                                Declaration

                            </h2>

                            <label className="flex items-start gap-3">

                                <input
                                    type="checkbox"
                                    name="declaration"
                                    checked={formData.declaration}
                                    onChange={handleChange}
                                    className="mt-1"
                                />

                                <span className="leading-7 text-gray-700 dark:text-gray-300">

                                    I confirm that the information provided in this
                                    application is true and complete. I understand
                                    that Zoiko Mobile may request additional
                                    documentation to verify my student status and
                                    that providing false information may result in
                                    the cancellation of the student discount.

                                </span>

                            </label>

                            {errors.declaration && (

                                <p className="mt-2 text-red-500 text-sm">

                                    {errors.declaration}

                                </p>

                            )}

                        </section>

                        {/* Signature */}

                        <section>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                <div>

                                    <label className="font-semibold">

                                        Signature *

                                    </label>

                                    <input
                                        name="signature"
                                        value={formData.signature}
                                        onChange={handleChange}
                                        className={inputClass}
                                        placeholder="Type your full name"
                                    />

                                    {errors.signature && (

                                        <p className="mt-1 text-sm text-red-500">

                                            {errors.signature}

                                        </p>

                                    )}

                                </div>

                                <div>

                                    <label className="font-semibold">

                                        Date *

                                    </label>

                                    <input
                                        type="date"
                                        name="declarationDate"
                                        value={formData.declarationDate}
                                        onChange={handleChange}
                                        className={inputClass}
                                    />

                                    {errors.declarationDate && (

                                        <p className="mt-1 text-sm text-red-500">

                                            {errors.declarationDate}

                                        </p>

                                    )}

                                </div>

                            </div>

                        </section>

                        {/* Submit */}

                        <div className="flex justify-center">

                            {/* <button
                                type="submit"
                                disabled={loading}
                                className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-sm md:text-base px-10 py-4 text-lg font-semibold text-white shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                            >

                                {loading
                                    ? "Submitting..."
                                    : "Submit Your Registration"}

                            </button> */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-[#DA1658] text-sm md:text-base px-10 py-4 text-lg font-semibold text-white shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                            >

                                {loading
                                    ? "Submitting..."
                                    : "Submit Your Registration"}

                            </button>
                        </div>

                        {/* Footer */}

                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-700 dark:bg-emerald-900/20">

                            <h3 className="text-xl font-bold text-emerald-700 dark:text-emerald-300">

                                Need Help?

                            </h3>

                            <p className="mt-3 text-gray-600 dark:text-gray-300">

                                If you have any questions regarding your
                                application or require assistance, please
                                contact the Zoiko Mobile Support Team.

                            </p>

                            <p className="mt-2 font-semibold text-sm md:text-base text-emerald-600 dark:text-emerald-400">

                                Email: support@zoikomobile.co.uk

                            </p>

                        </div>

                    </form>
                </div>
            </main>
        </>
    );
}
