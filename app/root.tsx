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
import type { LinksFunction, LoaderFunction } from "@remix-run/node";

import "./tailwind.css";
import styles from "./tailwind.css?url";
import LeftPanelNavigation from "./components/ui/left-panel";
import {
  PreventFlashOnWrongTheme,
  ThemeProvider,
  useTheme,
} from "remix-themes";
import { themeSessionResolver } from "./services/sessions.server";
import { clsx } from "clsx";
import { Separator } from "./components/ui/separator";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export const loader: LoaderFunction = async ({ request }) => {
  const { getTheme } = await themeSessionResolver(request);
  return {
    theme: getTheme(),
  };
};

// Wrap your app with ThemeProvider.
// `specifiedTheme` is the stored theme in the session storage.
// `themeAction` is the action name that's used to change the theme in the session storage.
export default function AppWithProviders() {
  const data = useLoaderData<typeof loader>();
  return (
    <ThemeProvider specifiedTheme={data.theme} themeAction="/action/set-theme">
      <App />
    </ThemeProvider>
  );
}

export function App() {
  const data = useLoaderData<typeof loader>();
  const [theme] = useTheme();

  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} />
        <Links />
      </head>
      <body>
        <div className="flex h-screen">
          <LeftPanelNavigation />
          <Separator orientation="vertical" />
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
