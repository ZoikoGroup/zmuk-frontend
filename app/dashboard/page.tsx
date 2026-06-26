import { Metadata } from "next";
import MyAccount from "./MyAccount";

export const metadata: Metadata = {
  title: "Zoiko Orbit | Login to Manage Your Services",
  description:
    "Log in to your Zoiko Orbit account now to manage your services, view and pay bills, track your usage & enjoy full control over your mobile plan & features.",
};

export default function LoginPage() {
  return <MyAccount />;
}