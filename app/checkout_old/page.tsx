import type { Metadata } from "next";
import Checkout from "./Checkout";

export const metadata: Metadata = {
  title: "Checkout | Zoiko Mobile",
  description: "Securely complete your Zoiko Mobile order.",
};

export default function Page() {
  return <Checkout />;
}
