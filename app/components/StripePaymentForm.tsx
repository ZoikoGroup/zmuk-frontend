"use client";

import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { forwardRef, useImperativeHandle, useState } from "react";

export type StripePaymentFormRef = {
  /**
   * Validates the PaymentElement, creates a PaymentIntent on the server for
   * the given amount, then confirms the payment. Returns success/error so the
   * caller can decide whether to proceed with persisting the order.
   */
  submitPayment: (args: {
    /** Amount to charge, in decimal pounds (e.g. 12.99). */
    amountGbp: number;
    email?: string;
    cartSummary?: { itemCount: number; variationIds: number[] };
  }) => Promise<{ success: boolean; error?: string }>;
};

interface StripePaymentFormProps {
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: string) => void;
}

const StripePaymentForm = forwardRef<StripePaymentFormRef, StripePaymentFormProps>(
  ({ onPaymentSuccess, onPaymentError }, ref) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    useImperativeHandle(ref, () => ({
      async submitPayment({ amountGbp, email, cartSummary }) {
        if (!stripe || !elements) {
          const error = "Stripe is not loaded yet";
          setErrorMessage(error);
          onPaymentError?.(error);
          return { success: false, error };
        }

        setLoading(true);
        setErrorMessage("");

        try {
          // 1. Trigger form validation and collect the payment details.
          //    Required by the deferred-intent flow before creating the PI.
          const { error: submitError } = await elements.submit();
          if (submitError) {
            const msg = submitError.message || "Please check your card details";
            setErrorMessage(msg);
            onPaymentError?.(msg);
            return { success: false, error: msg };
          }

          // 2. Create the PaymentIntent server-side for the exact cart total.
          const res = await fetch("/api/create-payment-intent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              totalGbp: amountGbp,
              customerEmail: email,
              cartSummary,
            }),
          });
          if (!res.ok) {
            const e = await res.json().catch(() => ({}));
            throw new Error(e.error || "Could not initialise payment");
          }
          const { clientSecret } = (await res.json()) as { clientSecret?: string };
          if (!clientSecret) throw new Error("Missing client secret");

          // 3. Confirm the payment.
          const { error } = await stripe.confirmPayment({
            elements,
            clientSecret,
            confirmParams: {
              return_url: `${window.location.origin}/payment-success`,
            },
            redirect: "if_required",
          });

          if (error) {
            const errorMsg = error.message || "Payment failed";
            setErrorMessage(errorMsg);
            onPaymentError?.(errorMsg);
            return { success: false, error: errorMsg };
          }

          onPaymentSuccess?.();
          return { success: true };
        } catch (err) {
          const errorMsg =
            err instanceof Error ? err.message : "An unexpected error occurred";
          setErrorMessage(errorMsg);
          onPaymentError?.(errorMsg);
          return { success: false, error: errorMsg };
        } finally {
          setLoading(false);
        }
      },
    }));

    return (
      <div className={loading ? "pointer-events-none opacity-60" : undefined}>
        <PaymentElement options={{ layout: "tabs" }} />
        {errorMessage && (
          <div
            className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
            role="alert"
          >
            {errorMessage}
          </div>
        )}
      </div>
    );
  }
);

StripePaymentForm.displayName = "StripePaymentForm";
export default StripePaymentForm;