import { redirect } from "next/navigation";

// The scroll landing is now the homepage. Keep the /new URL alive (it was
// shared for preview) by sending visitors to the homepage.
export default function NewPage() {
  redirect("/");
}
