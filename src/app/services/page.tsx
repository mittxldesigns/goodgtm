import { redirect } from "next/navigation";

// /services is now a section on the single scroll homepage. Keep the URL alive.
export default function ServicesPage() {
  redirect("/#services");
}
