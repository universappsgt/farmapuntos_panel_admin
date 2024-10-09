import type {
  ActionFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import {
  Form,
  Outlet,
  redirect,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { auth, requireAuth } from "firebase";
import LeftPanelNavigation from "~/components/ui/leftPanel";

export default function Index() {
  const { user } = useLoaderData<{ user: { email: string | null } | null }>();

  if (!user) {
    return redirect("/login");
  }

  return (
    <div className="flex h-screen">
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
  return;
}
