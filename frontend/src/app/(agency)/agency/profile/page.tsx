import { redirect } from "next/navigation";

export default function ProfileRedirect() {
  redirect("/agency/settings/profile");
}
