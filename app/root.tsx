import {
  json,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type {
  LinksFunction,
  LoaderFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";

import "./tailwind.css";
import styles from "./tailwind.css?url";
import { AuthProvider } from "./contexts/auth.context";
import { auth } from "firebase";
import LeftPanelNavigation from "./components/ui/leftPanel";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export const loader: LoaderFunction = async ({ request }) => {
  const user = auth.currentUser;
  return json({ user: user ? { uid: user.uid, email: user.email } : null });
};

export default function App() {
  useLoaderData();

  return (
    <html>
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="flex h-screen">
          <LeftPanelNavigation />
          <div className="flex flex-1 p-6 md:p-8 lg:p-10 overflow-auto">
            <div className="w-full max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
