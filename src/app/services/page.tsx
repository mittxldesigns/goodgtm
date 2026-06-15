import { redirect } from "next/navigation";

// Services is now a popup on the single-screen homepage; keep the URL alive.
export default function ServicesPage() {
  redirect("/");
}
