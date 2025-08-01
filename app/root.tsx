import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunction } from "@remix-run/node";

import "./tailwind.css";
import styles from "./tailwind.css?url";
import {
  PreventFlashOnWrongTheme,
  ThemeProvider,
  useTheme,
} from "remix-themes";
import { themeSessionResolver } from "./services/sessions.server";
import { clsx } from "clsx";
import { MainNavigation } from "./components/ui/main-navigation";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { Toaster } from "./components/ui/sonner";
import { auth } from "firebase";
import { fetchDocument } from "~/services/firestore.server";
import type { User } from "~/models/types";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export const loader: LoaderFunction = async ({ request }) => {
  const { getTheme } = await themeSessionResolver(request);
  
  // Obtener el token de la sesión
  const session = await auth.currentUser;
  let userData = null;

  if (session) {
    try {
      userData = await fetchDocument<User>("users", session.uid);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }
  
  // Establecer tema por defecto como "light" si no hay tema guardado
  const currentTheme = getTheme() || "light";
  
  return {
    theme: currentTheme,
    user: userData,
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
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            {data.user && <MainNavigation user={data.user} />}
            <main className="flex-1 w-full p-6">
              <div className="flex flex-col gap-6">
                {data.user && <SidebarTrigger />}
                <div className="w-full">
                  <Outlet />
                </div>
              </div>
            </main>
            <Toaster />
          </div>
        </SidebarProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
