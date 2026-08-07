import OrdersClient from "./OrdersClient";

export const metadata = {
  title: "My Orders | Zoiko Mobile Dashboard",
  description:
    "View all your Zoiko Mobile orders, transactions, billing history, and plan purchases in one place.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <OrdersClient />;
}