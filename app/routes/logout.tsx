import { redirect } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { auth } from "firebase";
import { signOut } from "firebase/auth";

export const action: ActionFunction = async () => {
  await signOut(auth);
  return redirect("/login");
}; 