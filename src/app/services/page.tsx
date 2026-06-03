import { redirect } from "next/navigation";

// /services is now a section on the single scroll page.
// Keep the URL alive by sending visitors to the section.
export default function ServicesPage() {
  redirect("/#services");
}
