import type { ActionFunction } from "@remix-run/node";
import { signOutUser } from "~/services/sessions.server";

export const action: ActionFunction = async ({ request }) => {
  return await signOutUser(request);
}; 