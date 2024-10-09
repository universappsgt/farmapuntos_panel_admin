import { useState } from "react";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, requireAuth } from "firebase";
import { Button } from "~/components/ui/button";
import { Label } from "@radix-ui/react-label";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const email = form.get("email");
  const password = form.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return json({ error: "Envío de formulario inválido" }, { status: 400 });
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    return redirect("/dashboard");
  } catch (error) {
    return json(
      { error: "Correo electrónico o contraseña inválidos" },
      { status: 401 }
    );
  }
};

export default function Login() {
  const actionData = useActionData<{ error?: string }>(); // Ensure correct typing
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Inicia sesión en tu cuenta
          </h2>
        </div>

        <Form method="post" className="space-y-6">
          <Card className="space-y-4 p-6">
            <CardHeader>
              <CardTitle>Inicia sesión en tu cuenta</CardTitle>
              <CardDescription>
                ¿No tienes una cuenta? <Link to="/register">Regístrate</Link>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={navigation.state === "submitting"}
              >
                {navigation.state === "submitting"
                  ? "Iniciando sesión..."
                  : "Iniciar sesión"}
              </Button>
            </CardFooter>
          </Card>
        </Form>

        {actionData?.error && (
          <div className="mt-2 text-center text-sm text-red-600">
            {actionData.error}
          </div>
        )}
      </div>
    </div>
  );
}
