import { redirect } from "@remix-run/node";
import { getCurrentUser } from "~/services/firebase-auth.server";

export const loader = async () => {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/login");
  }
  return redirect("/users");
};

export default function Index() {
  return null;
}
