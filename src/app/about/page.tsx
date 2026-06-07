import { redirect } from "next/navigation";

// /about is now a section on the single scroll homepage. Keep the URL alive.
export default function AboutPage() {
  redirect("/#about");
}
