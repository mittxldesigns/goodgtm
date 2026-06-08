import { redirect } from "next/navigation";

// The standalone /team page is gone (it used the old multi-page nav). Keep the
// URL alive by sending visitors to the single scroll homepage.
export default function TeamPage() {
  redirect("/");
}
