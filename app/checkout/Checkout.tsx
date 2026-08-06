"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import type { StripeElementsOptions } from "@stripe/stripe-js";
import { processOrderStripe } from "../utils/stripeWebPaymentApi";
import StripePaymentForm, { StripePaymentFormRef } from "../components/StripePaymentForm";

// ─────────────────────────────────────────────────────────────────────────────
// Merged checkout (Stripe + split routing).
//   Payment : Stripe covers the WHOLE cart in one PaymentIntent.
//   Routing : after payment succeeds, the cart is split —
//             • SIM lines (eSIM / pSIM)      → /api/sim/checkout-order/  (sim_orders)
//             • service / device lines       → processOrderStripe (BT) → /api/v1/bqorders/
//   Cart    : one contract that reads BOTH shapes — telecom `planType` fields
//             AND the `type` / `simType` fields — so a cart from either set of
//             plan pages renders correctly.
//   Shipping: an eSIM-only cart needs no address; anything physical does.
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
const SIM_ORDER_URL = `${API_BASE}/api/sim/checkout-order/`; // SIM orders  (sim_orders app)
const ORDER_URL = `${API_BASE}/api/v1/bqorders/`;            // service / device orders (BqOrder)


/** Raw shape coming from localStorage (as stored by any plan-selection page). */
interface RawCartItem {
  id: string | number;
  name?: string;
  price?: number | string;
  planPrice?: number | string;
  speed?: string;
  validity?: string | number;
  description?: string;
  address?: { display: string; city: string; postcode: string; [key: string]: any };

  
  planType?: string;            
  planName?: string;
  planTitle?: string;
  planDuration?: string;
  finalPrice?: number;
  salePrice?: number | string;
  dataAllowance?: string;
  eeCategory?: string;
  simType?: string;            
  billingPeriod?: "monthly" | "one-off";

  // ── SIM/device plan fields (newer shape) ──
  type?: "plan" | "product";
  slug?: string;
  metadata?: Record<string, any>;

  // ── Quantity — accessories / phone_equipment only ──
  qty?: number;
  quantity?: number;

  [key: string]: any;
}

/** Normalised shape used throughout the component. */
interface CartItem {
  id: string | number;
  title: string;
  price: number;
  description: string;
  validity: string;
  speed: string;
  serviceAddress?: string;
  planType?: string;
  type: "plan" | "product";
  isLandline?: boolean;
  isBusinessLandline?: boolean;
  isEEMobile?: boolean;
  isBroadband?: boolean;
  isAccessories?: boolean;
  isPhoneEquipment?: boolean;
  dataAllowance?: string;
  categoryLabel?: string;
  simType?: string;             // display value, e.g. "eSIM" / "pSIM"
  quantity: number;
  _raw: RawCartItem;
}

interface Address {
  firstName: string; lastName: string; companyName: string; region: string;
  state: string; city: string; street: string; houseNumber: string;
  zip: string; phone: string; email: string;
}

interface DiscountData { type: "percentage" | "flat"; discount: string | number; }
interface FormErrors { [key: string]: string; }

// ── Normalise a raw localStorage item into CartItem ───────────────────────────

function normalizeCartItem(raw: RawCartItem): CartItem {
  const isLandline = raw.planType === "landline_manual";
  const isBusinessLandline = raw.planType === "business_landline";
  const isEEMobile = raw.planType === "ee_mobile_manual";
  const isBroadband = raw.planType === "broadband";
  const isAccessories = raw.planType === "accessories";
  const isPhoneEquipment = raw.planType === "phone_equipment";

  // Price can arrive as price / finalPrice / salePrice / planPrice (string or number).
  const rawPrice = raw.price ?? raw.finalPrice ?? raw.salePrice ?? raw.planPrice ?? 0;
  const price = typeof rawPrice === "number" ? rawPrice : parseFloat(String(rawPrice)) || 0;

  // Quantity only applies to accessories / phone_equipment; everything else is a single line.
  const rawQty = raw.qty ?? raw.quantity ?? 1;
  const quantity =
    isAccessories || isPhoneEquipment ? Math.max(1, Math.floor(Number(rawQty) || 1)) : 1;

  const validity = (() => {
    if (typeof raw.planDuration === "string" && raw.planDuration) return raw.planDuration;
    if (raw.validity !== undefined && raw.validity !== "") return `${raw.validity} Months`;
    return "";
  })();

  // simType may be a top-level field (telecom) or on metadata (newer SIM shape).
  const simType = (raw.simType ?? raw.metadata?.simType) as string | undefined;

  // type: honour an explicit `type`, else derive (accessories / phone = product).
  const type: "plan" | "product" =
    raw.type === "plan" || raw.type === "product"
      ? raw.type
      : isAccessories || isPhoneEquipment
      ? "product"
      : "plan";

  return {
    id: raw.id,
    title: raw.name ?? raw.planName ?? raw.planTitle ?? "Unnamed Service",
    price,
    description: raw.description ?? "",
    validity,
    speed: !isLandline && !isEEMobile && raw.speed ? `${raw.speed} Mbps` : "",
    serviceAddress: raw.address?.display ?? "",
    planType: raw.planType,
    type,
    isLandline, isBusinessLandline, isEEMobile, isBroadband, isAccessories, isPhoneEquipment,
    dataAllowance: isEEMobile ? raw.dataAllowance : undefined,
    categoryLabel: isEEMobile ? raw.eeCategory : undefined,
    simType: simType || undefined,
    quantity,
    _raw: raw,
  };
}

// ── SIM / physical helpers (drive routing + conditional shipping) ─────────────
const simFlag = (s?: string) => (s ?? "").toLowerCase().replace(/[\s-]/g, "");
const isESim = (i: CartItem) => simFlag(i.simType).includes("esim");
const isSim = (i: CartItem) => {
  const f = simFlag(i.simType);
  return f.includes("esim") || f.includes("psim");
};
/** Physical = needs a delivery/service address. eSIM is the only non-physical line. */
const isPhysical = (i: CartItem) =>
  Boolean(
    i.isAccessories || i.isPhoneEquipment || i.isBroadband || i.isLandline ||
    i.isBusinessLandline || (isSim(i) && !isESim(i))
  );

// ── Small reusable components ─────────────────────────────────────────────────

const InputField = ({
  label, required, error, children,
}: { label: string; required?: boolean; error?: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const inputClass = (error?: string) =>
  `w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors
   focus:ring-2 focus:ring-red-300 focus:border-red-400
   ${error ? "border-red-400 bg-red-50 dark:bg-red-900" : "border-gray-200 bg-white dark:bg-gray-800 "}`;

// ── Address Form ──────────────────────────────────────────────────────────────

const billingFieldMeta: Record<string, { label: string; placeholder: string; disabled?: boolean }> = {
  firstName:   { label: "First Name",       placeholder: "Enter your first name" },
  lastName:    { label: "Last Name",        placeholder: "Enter your last name" },
  companyName: { label: "Company Name",     placeholder: "Company name (optional)" },
  region:      { label: "Country / Region", placeholder: "United States (US)" },
  state:       { label: "State",            placeholder: "Select state" },
  city:        { label: "City",             placeholder: "Enter your city" },
  street:      { label: "Street Address",   placeholder: "Enter your street address" },
  houseNumber: { label: "Apt / Suite",      placeholder: "Apartment or suite" },
  zip:         { label: "ZIP Code (max 12 characters)", placeholder: "Enter ZIP code" },
  phone:       { label: "Phone Number",     placeholder: "Enter phone number" },
  email:       { label: "Email Address",    placeholder: "Enter email address" },
};

// Always required (contact); required only when an address is needed (delivery).
const alwaysRequiredFields = ["firstName", "lastName", "email", "phone"];
const addressRequiredFields = ["state", "city", "houseNumber", "zip"];
const addressOnlyKeys = ["region", "state", "city", "street", "houseNumber", "zip"];

const AddressForm = ({
  address, setAddress, prefix, errors, loading,
  includeShipping = false, requireAddress = true, onValidateField,
}: {
  address: Address;
  setAddress: (a: Address) => void;
  prefix: string;
  errors: FormErrors;
  loading: boolean;
  includeShipping?: boolean;
  requireAddress?: boolean;
  onValidateField: (errKey: string, value: string, filterMsg?: string) => void;
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
    {(Object.keys(address) as Array<keyof Address>)
      // Hide address-only fields entirely when no delivery address is needed (eSIM-only).
      .filter((key) => requireAddress || !addressOnlyKeys.includes(key))
      .map((key) => {
        const meta = billingFieldMeta[key] || { label: key, placeholder: key };
        const errKey = `${prefix}${key.charAt(0).toUpperCase() + key.slice(1)}`;
        const isRequired =
          alwaysRequiredFields.includes(key) ||
          (requireAddress && addressRequiredFields.includes(key)) ||
          (includeShipping && ["firstName", "lastName", "state", "city", "houseNumber", "zip", "email"].includes(key));

        const isPhone = key === "phone";
        const isZip = key === "zip";

        const handleChange = (rawVal: string) => {
          let value = rawVal;
          let filterMsg = "";
          if (isPhone) {
            const digitsOnly = rawVal.replace(/\D/g, "");
            value = digitsOnly.slice(0, 15);
            if (digitsOnly !== rawVal) filterMsg = "Only numbers are allowed";
            else if (digitsOnly.length > 15) filterMsg = "Phone number cannot exceed 15 digits";
          } else if (isZip) {
            value = rawVal.slice(0, 12);
            if (rawVal.length > 12) filterMsg = "ZIP code cannot exceed 12 characters";
          }
          setAddress({ ...address, [key]: value });
          onValidateField?.(errKey, value, filterMsg);
        };

        return (
          <InputField key={key} label={meta.label} required={isRequired} error={errors[errKey]}>
            <input
              type="text"
              inputMode={isPhone ? "numeric" : undefined}
              className={inputClass(errors[errKey])}
              placeholder={meta.placeholder}
              value={address[key]}
              disabled={meta.disabled || loading}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={(e) => onValidateField?.(errKey, e.target.value)}
            />
          </InputField>
        );
      })}
  </div>
);

// ── Modal ─────────────────────────────────────────────────────────────────────
const Modal = ({
  show, onClose, title, children,
}: { show: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function Checkout() {
  const stripeFormRef = useRef<StripePaymentFormRef>(null);
  const [showOrderErrorPopup, setShowOrderErrorPopup] = useState(false);
  const [orderError, setOrderError] = useState("");
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");
  const [clientSecret, setClientSecret] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showShipping, setShowShipping] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [loading, setLoading] = useState(false);
  const [discountData, setDiscountData] = useState<DiscountData | null>(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showTermsPopup, setShowTermsPopup] = useState(false);

  // Stripe iframe can't inherit dark styling — detect it by measuring the
  // payment card's actual background and hand Stripe a matching appearance.
  const paymentCardRef = useRef<HTMLDivElement>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const compute = () => {
      let el: HTMLElement | null = paymentCardRef.current;
      let bg = "";
      while (el) {
        const c = getComputedStyle(el).backgroundColor;
        if (c && c !== "transparent" && !c.startsWith("rgba(0, 0, 0, 0")) { bg = c; break; }
        el = el.parentElement;
      }
      if (!bg) bg = getComputedStyle(document.body).backgroundColor;
      const rgb = bg.match(/\d+/g);
      setIsDark(rgb ? Number(rgb[0]) + Number(rgb[1]) + Number(rgb[2]) < 384 : false);
    };
    compute();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", compute);
    const observer = new MutationObserver(compute);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme", "style"] });
    return () => { mq.removeEventListener("change", compute); observer.disconnect(); };
  }, []);

  const stripeOptions: StripeElementsOptions = useMemo(() => ({
    clientSecret,
    appearance: {
      theme: isDark ? "night" : "stripe",
      variables: {
        colorPrimary: "#ef4444",
        colorBackground: isDark ? "#1f2937" : "#ffffff",
        colorText: isDark ? "#f9fafb" : "#111827",
        colorDanger: "#ef4444",
        colorTextPlaceholder: isDark ? "#9ca3af" : "#6b7280",
        borderRadius: "12px",
        fontFamily: "Inter, sans-serif",
      },
      rules: {
        ".Input": { backgroundColor: isDark ? "#111827" : "#ffffff", border: isDark ? "1px solid #374151" : "1px solid #d1d5db", boxShadow: "none" },
        ".Input:focus": { border: "1px solid #ef4444", boxShadow: "0 0 0 1px #ef4444" },
        ".Tab": { backgroundColor: isDark ? "#111827" : "#f9fafb", border: isDark ? "1px solid #374151" : "1px solid #d1d5db" },
        ".Tab--selected": { border: "1px solid #ef4444", boxShadow: "0 0 0 1px #ef4444" },
        ".Label": { color: isDark ? "#f3f4f6" : "#111827" },
      },
    },
  }), [clientSecret, isDark]);

  const emptyAddress: Address = {
    firstName: "", lastName: "", companyName: "", region: "United States (US)",
    state: "", city: "", street: "", houseNumber: "", zip: "", phone: "", email: "",
  };

  const [billingAddress, setBillingAddress] = useState<Address>(emptyAddress);
  const [shippingAddress, setShippingAddress] = useState<Address>(emptyAddress);
  const [errors, setErrors] = useState<FormErrors>({});

  // ── Load & normalise cart ─────────────────────────────────────────────────
  useEffect(() => {
    try {
      const storedCart = JSON.parse(localStorage.getItem("cart") ?? "[]") as RawCartItem[];
      const normalized: CartItem[] = (Array.isArray(storedCart) ? storedCart : []).map(normalizeCartItem);
      setCart(normalized);
      if (typeof window !== "undefined" && localStorage.getItem("token")) setIsLoggedIn(true);
    } catch {
      setCart([]);
    }
  }, []);

  // ── Derived: does this cart need a delivery/service address? ──────────────
  // eSIM-only cart → no address required. Anything physical → address required.
  const needsAddress = useMemo(() => cart.some(isPhysical), [cart]);

  // ── Cart mutations ────────────────────────────────────────────────────────
  const handleRemove = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart.map((i) => i._raw)));
    window.dispatchEvent(new Event("cart-updated"));
  };

  const handleQuantityChange = (index: number, nextQty: number) => {
    const qty = Math.max(1, Math.floor(nextQty) || 1);
    setCart((prev) => {
      const next = prev.map((item, i) => {
        if (i !== index) return item;
        if (!item.isAccessories && !item.isPhoneEquipment) return item;
        return { ...item, quantity: qty, _raw: { ...item._raw, qty, quantity: qty } };
      });
      try {
        localStorage.setItem("cart", JSON.stringify(next.map((i) => i._raw)));
        window.dispatchEvent(new Event("cart-updated"));
      } catch { /* ignore storage errors */ }
      return next;
    });
  };

  // ── Coupon ────────────────────────────────────────────────────────────────
  const handleApplyCoupon = async () => {
    const user = JSON.parse(localStorage.getItem("user") ?? "null");
    if (!user) { setShowLoginPopup(true); return; }
    if (!coupon) { setCouponMessage("Please enter a coupon code"); return; }
    setLoading(true);
    setCouponMessage("");
    try {
      const res = await fetch(`${API_BASE}/api/v1/apply-coupon/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ user_id: user.id, email: user.email, coupon_code: coupon }),
      });
      const data = await res.json();
      if (data.success) {
        setDiscountData(data.data);
        const num = parseFloat(data.data.discount);
        const clean = Number.isInteger(num) ? num.toString() : num.toFixed(2);
        setCouponMessage(`Coupon applied! Discount: ${data.data.type === "percentage" ? clean + "%" : "£" + clean + " flat"}`);
      } else {
        setDiscountData(null);
        setCouponMessage(data.message || "Invalid coupon code");
      }
    } catch {
      setDiscountData(null);
      setCouponMessage("Something went wrong, please try again.");
    }
    setLoading(false);
  };

  const handleCancelCoupon = () => {
    setCoupon("");
    setDiscountData(null);
    setCouponMessage("Coupon cancelled.");
  };

  // ── Totals ────────────────────────────────────────────────────────────────
  const subtotal = cart.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);
  const discountAmount = discountData
    ? discountData.type === "percentage"
      ? (subtotal * Number(discountData.discount)) / 100
      : Number(discountData.discount)
    : 0;
  const total = Math.max(subtotal - (discountAmount || 0), 0);

  // ── Create Stripe payment intent (whole cart) ─────────────────────────────
  useEffect(() => {
    if (total > 0 && cart.length > 0) {
      fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total, subtotal, discountAmount, cart, billingAddress, shippingAddress }),
      })
        .then((r) => r.json())
        .then((d) => { if (d.clientSecret) setClientSecret(d.clientSecret); })
        .catch(() => {});
    }
  }, [total, subtotal, discountAmount, cart]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Field validators ──────────────────────────────────────────────────────
  const validateZip = (zip: string) => {
    const v = zip.trim();
    if (!v) return "Required";
    if (v.length > 12) return "ZIP code cannot exceed 12 characters";
    return "";
  };
  const validatePhone = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    if (!digits) return "Required";
    if (digits.length < 10) return "Phone number must be at least 10 digits";
    if (digits.length > 15) return "Phone number cannot exceed 15 digits";
    return "";
  };

  const validateFields = (): boolean => {
    const newErrors: FormErrors = {};
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Contact is always required.
    newErrors.billingFirstName = billingAddress.firstName ? "" : "Required";
    newErrors.billingLastName = billingAddress.lastName ? "" : "Required";
    newErrors.billingEmail = emailRx.test(billingAddress.email) ? "" : "Invalid email";
    newErrors.billingPhone = validatePhone(billingAddress.phone);

    // Delivery address only required when the cart contains a physical item.
    if (needsAddress) {
      newErrors.billingState = billingAddress.state ? "" : "Required";
      newErrors.billingCity = billingAddress.city ? "" : "Required";
      newErrors.billingHouseNumber = billingAddress.houseNumber ? "" : "Required";
      newErrors.billingZip = validateZip(billingAddress.zip);
    }

    if (showShipping) {
      newErrors.shippingFirstName = shippingAddress.firstName ? "" : "Required";
      newErrors.shippingLastName = shippingAddress.lastName ? "" : "Required";
      newErrors.shippingState = shippingAddress.state ? "" : "Required";
      newErrors.shippingCity = shippingAddress.city ? "" : "Required";
      newErrors.shippingHouseNumber = shippingAddress.houseNumber ? "" : "Required";
      newErrors.shippingZip = validateZip(shippingAddress.zip);
      newErrors.shippingEmail = emailRx.test(shippingAddress.email) ? "" : "Invalid email";
      newErrors.shippingPhone = validatePhone(shippingAddress.phone);
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((e) => e.length > 0);
  };

  const validateOneField = (errKey: string, value: string, filterMsg?: string) => {
    if (filterMsg) { setErrors((prev) => ({ ...prev, [errKey]: filterMsg })); return; }
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let msg = "";
    if (errKey.endsWith("Zip")) msg = validateZip(value);
    else if (errKey.endsWith("Phone")) msg = validatePhone(value);
    else if (errKey.endsWith("Email")) msg = emailRx.test(value) ? "" : "Invalid email";
    else if (errKey.endsWith("CompanyName")) msg = "";
    else msg = value.trim() ? "" : "Required";
    setErrors((prev) => ({ ...prev, [errKey]: msg }));
  };

  // Build a billing-summary product list from a set of cart lines.
  const buildProducts = (items: CartItem[]) =>
    items.map((item) => {
      const unitPrice = Number(item.price ?? 0);
      const quantity = item.quantity;
      return {
        id: item.id,
        name: item.title,
        pricePerUnit: unitPrice,
        quantity,
        totalPrice: unitPrice * quantity,
        description: item.description,
        validity: item.validity,
        speed: item.speed,
        simType: item.simType,
        address: item.serviceAddress,
      };
    });

  const sum = (items: CartItem[]) => items.reduce((a, it) => a + (it.price || 0) * it.quantity, 0);

  // ── Place Order — Stripe pays for the whole cart, then routing splits the save ──
  const handlePlaceOrderStripe = async () => {
    if (!agreeTerms) { setShowTermsPopup(true); return; }
    if (!validateFields()) return;

    try {
      setLoading(true);

      // 1) Stripe payment for the WHOLE cart (one PaymentIntent).
      if (stripeFormRef.current) {
        const result = await stripeFormRef.current.submitPayment();
        if (!result.success) {
          setOrderError(result.error || "Payment failed.");
          setShowOrderErrorPopup(true);
          return;
        }
      }

      const effectiveShipping = showShipping ? shippingAddress : billingAddress;

      // 2) Split the paid cart.
      const simLines = cart.filter(isSim);              // eSIM / pSIM → sim_orders
      const btLines = cart.filter((i) => !isSim(i));    // service / device → BT → bqorders

      let anySaved = false;
      const failedLegs: string[] = [];

      // 2a) SIM lines → sim_orders app.
      if (simLines.length > 0) {
        try {
          const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
          const simSub = sum(simLines);
          const simRes = await fetch(SIM_ORDER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Token ${token}` } : {}) },
            body: JSON.stringify({
              billingAddress,
              shippingAddress: effectiveShipping,
              cart: simLines.map((i) => ({
                id: i.id, name: i.title, price: i.price, qty: i.quantity,
                simType: i.simType ?? null, type: i.type,
                dataAllowance: i.dataAllowance, validity: i.validity,
              })),
              totals: { subtotal: simSub, discount: 0, total: simSub },
              coupon: discountData ? { ...discountData } : null,
              paymentMethod: "stripe",
              order_type: "sim",
              createdAt: new Date().toISOString(),
            }),
          });
          const simData = await simRes.json().catch(() => ({}));
          if (simRes.ok && (simData?.success ?? true)) anySaved = true;
          else failedLegs.push("SIM");
        } catch {
          failedLegs.push("SIM");
        }
      }

      // 2b) Service / device lines → processOrderStripe (BT) → bqorders.
      //     processOrderStripe reads the raw cart from localStorage, so scope it
      //     to the BT lines only for the duration of the call, then restore.
      if (btLines.length > 0) {
        const originalCart = typeof window !== "undefined" ? localStorage.getItem("cart") : null;
        try {
          localStorage.setItem("cart", JSON.stringify(btLines.map((i) => i._raw)));
          const btSub = sum(btLines);
          const orderData = {
            billingAddress,
            shippingAddress: effectiveShipping,
            coupon: discountData ? { ...discountData } : null,
            cart: buildProducts(btLines), // billing-summary view; BT route uses the raw cart from localStorage
            totals: { subtotal: btSub, discount: discountAmount, total: Math.max(btSub - discountAmount, 0) },
            agreedToTerms: agreeTerms,
            paymentMethod: "stripe",
            createdAt: new Date().toISOString(),
          };

          const response = await processOrderStripe(orderData);

          if (!response?.status) {
            failedLegs.push("service/device");
          } else {
            const orders = (response as Record<string, unknown>).orders as Record<string, unknown>[] | undefined;
            const payloads = orders && orders.length ? orders : [((response as Record<string, unknown>).data ?? response)];
            let saved = 0;
            for (const payload of payloads) {
              try {
                const orderRes = await fetch(ORDER_URL, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                });
                const d = await orderRes.json().catch(() => ({}));
                if (orderRes.ok && d?.success) saved += 1;
              } catch { /* ignore per-payload error, keep going */ }
            }
            if (saved > 0) anySaved = true;
            else failedLegs.push("service/device");
          }
        } catch {
          failedLegs.push("service/device");
        } finally {
          // Restore the cart; it's cleared below only on overall success.
          if (originalCart !== null) localStorage.setItem("cart", originalCart);
        }
      }

      if (!anySaved) {
        setOrderError(
          `Payment succeeded but your ${failedLegs.join(" & ") || "order"} could not be saved. ` +
          `Please contact support with your payment reference — you will not be charged twice.`
        );
        setShowOrderErrorPopup(true);
        return;
      }

      // Order(s) saved (fully or partially) — clear the cart.
      try {
        localStorage.removeItem("cart");
        window.dispatchEvent(new Event("cart-updated"));
      } catch { /* ignore storage errors */ }
      setShowThankYou(true);
    } catch (err: any) {
      setOrderError(err?.message || "Something went wrong.");
      setShowOrderErrorPopup(true);
    } finally {
      setLoading(false);
    }
  };

  const formatDiscount = (value: string | number) => {
    const n = parseFloat(String(value));
    return Number.isInteger(n) ? n.toString() : n.toFixed(2);
  };

  // ── Empty Cart ────────────────────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="min-h-screen dark:bg-gray-900 bg-gray-50 flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="w-40 h-40 bg-red-50 dark:bg-red-900 rounded-full flex items-center justify-center mb-6">
          <svg className="w-20 h-20 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold dark:text-white text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Looks like you haven&rsquo;t added anything yet.</p>
      </div>
    );
  }

  // ── Main Checkout ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen dark:bg-gray-900 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Left Column ── */}
          <div className="flex-1 space-y-6">

            {/* Cart Items */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-gray-900 dark:text-white">Your Items</h2>
                <span className="text-xs text-gray-400 font-medium">{cart.length} item{cart.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="divide-y divide-gray-50">
                {cart.map((item, idx) => (
                  <div key={idx} className="px-6 py-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white text-lg leading-tight mb-1">{item.title}</p>

                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          {item.isLandline && (
                            <span className="bg-purple-50 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                              Business Landline
                            </span>
                          )}
                          {item.isBusinessLandline && (
                            <span className="bg-[#E91E8C]/10 text-[#E91E8C] text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.68l1.5 4.5a1 1 0 01-.5 1.21l-2.26 1.13a11 11 0 005.52 5.52l1.13-2.26a1 1 0 011.21-.5l4.5 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.72 21 3 14.28 3 6V5z" /></svg>
                              Business Landline
                            </span>
                          )}
                          {item.isEEMobile && (
                            <span className="bg-pink-50 text-pink-700 text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-1m-6-8h8m0 0V4m0 3v3" /></svg>
                              EE Mobile{item.dataAllowance ? ` · ${item.dataAllowance}` : ""}
                            </span>
                          )}
                          {item.isBroadband && (
                            <span className="bg-[#c61b7f]/10 text-[#c61b7f] text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12.55a11 11 0 0114 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01" /></svg>
                              Broadband
                            </span>
                          )}
                          {item.isAccessories && (
                            <span className="bg-[#7B2983]/10 text-[#7B2983] text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                              Accessories
                            </span>
                          )}
                          {item.isPhoneEquipment && (
                            <span className="bg-[#C12172]/10 text-[#C12172] text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.68l1.5 4.5a1 1 0 01-.5 1.21l-2.26 1.13a11 11 0 005.52 5.52l1.13-2.26a1 1 0 011.21-.5l4.5 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.72 21 3 14.28 3 6V5z" /></svg>
                              Phone &amp; Equipment
                            </span>
                          )}
                          {item.simType && (
                            <span className="bg-teal-50 text-teal-700 text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 3h6l4 4v12a2 2 0 01-2 2H8a2 2 0 01-2-2V5a2 2 0 012-2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 13h6m-6 4h6m-6-8h2" /></svg>
                              {item.simType}
                            </span>
                          )}
                          {item.speed && (
                            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                              {item.speed}
                            </span>
                          )}
                          {item.validity && <span className="text-xs text-gray-500 font-medium">Contract: {item.validity}</span>}
                          {item.categoryLabel && <span className="text-xs text-gray-500 font-medium">{item.categoryLabel}</span>}
                        </div>

                        {item.serviceAddress && (
                          <p className="text-xs text-gray-400 flex items-start gap-1">
                            <svg className="w-3 h-3 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {item.serviceAddress}
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-bold dark:text-white text-lg">£{(item.price * item.quantity).toFixed(2)}</p>
                        {item.quantity > 1 && <p className="text-xs text-gray-400 mt-0.5">£{item.price.toFixed(2)} × {item.quantity}</p>}
                        {(item.isAccessories || item.isPhoneEquipment) && (
                          <div className="mt-2 inline-flex items-center rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <button type="button" onClick={() => handleQuantityChange(idx, item.quantity - 1)} disabled={loading || item.quantity <= 1} aria-label="Decrease quantity" className="px-2.5 py-1 text-base leading-none text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">−</button>
                            <input type="number" min={1} value={item.quantity} disabled={loading} onChange={(e) => handleQuantityChange(idx, parseInt(e.target.value, 10))} className="w-10 py-1 text-center text-sm font-semibold bg-transparent text-gray-900 dark:text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                            <button type="button" onClick={() => handleQuantityChange(idx, item.quantity + 1)} disabled={loading} aria-label="Increase quantity" className="px-2.5 py-1 text-base leading-none text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors">+</button>
                          </div>
                        )}
                        <div>
                          <button onClick={() => handleRemove(idx)} className="text-xs text-red-500 hover:underline mt-1">Remove</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coupon */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">Have a Coupon?</h2>
              <div className="flex flex-col md:flex-row gap-2">
                <input type="text" className="flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-300" placeholder="Enter coupon code" value={coupon} onChange={(e) => setCoupon(e.target.value)} disabled={loading} />
                <button onClick={handleApplyCoupon} disabled={loading} className="px-4 py-2.5 rounded-lg bg-[#10446c] hover:bg-[#0d3a5a] text-white text-sm font-semibold transition-colors disabled:opacity-50">{loading ? "Applying…" : "Apply"}</button>
                {discountData && <button onClick={handleCancelCoupon} disabled={loading} className="px-4 py-2.5 rounded-lg border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50">Remove</button>}
              </div>
              {couponMessage && <p className={`mt-2 text-sm ${discountData ? "text-green-600" : "text-red-500"}`}>{couponMessage}</p>}
              {!isLoggedIn && <p className="mt-2 text-xs text-[#10446c] dark:text-gray-400">You need to be logged in to apply a coupon.</p>}
            </div>

            {/* Billing / Service Address */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 dark:text-white mb-5">Service / Billing Details</h2>

              {!needsAddress && (
                <div className="mb-5 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-300">
                  Your order is eSIM only — no delivery address needed. We&rsquo;ll email your eSIM &amp; activation code.
                </div>
              )}

              <AddressForm
                address={billingAddress}
                setAddress={setBillingAddress}
                prefix="billing"
                errors={errors}
                loading={loading}
                requireAddress={needsAddress}
                onValidateField={validateOneField}
              />

              {needsAddress && (
                <label className="flex items-center gap-2.5 mt-5 cursor-pointer">
                  <input type="checkbox" checked={showShipping} onChange={(e) => setShowShipping(e.target.checked)} disabled={loading} className="w-4 h-4 accent-red-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Ship to a different address?</span>
                </label>
              )}

              {needsAddress && showShipping && (
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-4">Shipping Address</h3>
                  <AddressForm
                    address={shippingAddress}
                    setAddress={setShippingAddress}
                    prefix="shipping"
                    errors={errors}
                    loading={loading}
                    includeShipping
                    requireAddress
                    onValidateField={validateOneField}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ── Right Column ── */}
          <div className="w-full lg:w-96 space-y-6">

            {/* Order Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">Order Summary</h2>
              <div className="space-y-3">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-2 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{item.title}</p>
                      {item.quantity > 1 && <span className="text-xs text-gray-500 dark:text-gray-400">£{item.price.toFixed(2)} × {item.quantity}</span>}
                      {item.simType && <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">{item.simType}</span>}
                      {item.speed && <span className="text-xs text-gray-500 dark:text-gray-400">Speed: {item.speed}</span>}
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white shrink-0">£{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {discountData && (
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-500">Discount ({discountData.type === "percentage" ? formatDiscount(discountData.discount) + "%" : "£" + formatDiscount(discountData.discount)})</span>
                  <span className="font-medium text-green-600">−£{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-base mt-4 pt-4 border-t border-gray-100">
                <span>Total</span>
                <span className="text-red-500">£{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment */}
            <div ref={paymentCardRef} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">Payment</h2>

              {clientSecret ? (
                <Elements key={`${clientSecret}-${isDark ? "dark" : "light"}`} stripe={stripePromise} options={stripeOptions}>
                  <StripePaymentForm ref={stripeFormRef} />
                </Elements>
              ) : (
                <div className="flex items-center justify-center py-6 gap-2 text-sm text-gray-400">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Loading payment form…
                </div>
              )}

              <label className="flex items-start gap-2.5 mt-5 cursor-pointer">
                <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} disabled={loading} className="w-4 h-4 mt-0.5 accent-red-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  I have read and agree to the website <a href="/terms-and-conditions" className="text-red-500 hover:underline">terms and conditions</a>.
                </span>
              </label>

              <button onClick={handlePlaceOrderStripe} disabled={loading || !clientSecret} className="w-full mt-5 py-3.5 rounded-xl bg-[#10446c] hover:bg-[#0d3a5a] text-white font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Processing payment…
                  </>
                ) : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <Modal show={showLoginPopup} onClose={() => setShowLoginPopup(false)} title="Login Required">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          <p className="text-gray-600 mb-5 text-sm">You need to log in to apply a coupon code.</p>
          <a href={`/login?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "/")}`} className="block w-full py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors mb-2">Go to Login</a>
          <button onClick={() => setShowLoginPopup(false)} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Cancel</button>
        </div>
      </Modal>

      <Modal show={showTermsPopup} onClose={() => setShowTermsPopup(false)} title="Terms & Conditions Required">
        <div className="text-center">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <p className="text-gray-600 mb-5 text-sm">You must agree to the <a href="/terms-and-conditions" className="text-red-500 hover:underline">terms and conditions</a> before placing your order.</p>
          <button onClick={() => setShowTermsPopup(false)} className="w-full py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors">OK, I understand</button>
        </div>
      </Modal>

      <Modal
        show={showThankYou}
        onClose={() => { setShowThankYou(false); setCart([]); window.location.href = "/dashboard"; }}
        title=""
      >
        <div className="text-center py-4">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-30" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Order Placed! 🎉</h2>
          <p className="text-sm font-medium text-green-600 mb-4">Payment successful</p>
          <div className="border-t border-gray-100 my-4" />
          <div className="bg-gray-50 rounded-xl p-4 mb-5 text-left space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="font-semibold text-gray-800">£{subtotal.toFixed(2)}</span></div>
            {discountAmount > 0 && <div className="flex justify-between text-sm"><span className="text-gray-500">Discount</span><span className="font-semibold text-green-600">−£{discountAmount.toFixed(2)}</span></div>}
            <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-bold"><span className="text-gray-900">Total Paid</span><span className="text-red-500">£{total.toFixed(2)}</span></div>
          </div>
          <p className="text-xs text-gray-400 mb-5">A confirmation email has been sent to <span className="font-medium text-gray-600">{billingAddress.email}</span></p>
          <button onClick={() => { setShowThankYou(false); setCart([]); window.location.href = "/dashboard"; }} className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-bold text-sm transition-all shadow-md hover:shadow-lg mb-2">Go to Dashboard →</button>
          <button onClick={() => { setCart([]); window.location.href = "/"; }} className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm font-medium transition-colors">Continue Shopping</button>
        </div>
      </Modal>

      <Modal show={showOrderErrorPopup} onClose={() => setShowOrderErrorPopup(false)} title="Order Failed">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <p className="text-gray-600 mb-5 text-sm">{orderError}</p>
          <button onClick={() => setShowOrderErrorPopup(false)} className="w-full py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors">Try Again</button>
        </div>
      </Modal>
    </div>
  );
}