import { redirect } from "@remix-run/node";
import { getCurrentUser } from "~/services/firebase-auth.server";

export const loader = async ({ request }: { request: Request }) => {
  const user = await getCurrentUser(request);
  if (!user) {
    return redirect("/login");
  }
  return redirect("/users");
};

export default function Index() {
  return null;
}
