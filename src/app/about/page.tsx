import { redirect } from "next/navigation";

// About is now a popup on the single-screen homepage; keep the URL alive.
export default function AboutPage() {
  redirect("/");
}
