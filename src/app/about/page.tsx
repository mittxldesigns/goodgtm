import { redirect } from "next/navigation";

// /about is now a section on the single scroll page.
// Keep the URL alive by sending visitors to the section.
export default function AboutPage() {
  redirect("/#about");
}
