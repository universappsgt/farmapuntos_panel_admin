import { useState } from "react";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "firebase";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { doc, getDoc } from "firebase/firestore";
import { db } from "firebase";
import { getSessionUser, createUserSession } from "~/services/sessions.server";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getSessionUser(request);
  if (user) {
    return redirect("/users");
  }
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return json({ error: "Formulario inválido" }, { status: 400 });
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
    
    if (!userDoc.exists()) {
      await signOut(auth);
      return json(
        { error: "Usuario no encontrado" },
        { status: 401 }
      );
    }

    const userData = userDoc.data();
    if (!userData.isAdministrator) {
      await signOut(auth);
      return json(
        { error: "No tienes permisos de administrador" },
        { status: 403 }
      );
    }

    if (userData.accountStatus !== "active") {
      await signOut(auth);
      return json(
        { error: "Tu cuenta no está activa. Por favor, contacta al administrador." },
        { status: 403 }
      );
    }

    return await createUserSession(userCredential.user, "/users");
  } catch (error) {
    return json(
      { error: "Correo electrónico o contraseña inválidos" },
      { status: 401 }
    );
  }
};

export default function Login() {
  const actionData = useActionData<{ error: string }>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[350px]">
        <CardHeader className="text-center">
            <div className="flex flex-col items-center justify-center mb-2">
              <img src="/farmapuntos.png" alt="Farmapuntos" className="p-10"/>
            </div>
            <CardTitle>Inicia sesión en tu cuenta</CardTitle>
            <CardDescription>
              Ingresa tu correo electrónico y contraseña para iniciar sesión.
            </CardDescription>
          </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="ejemplo@correo.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
              />
            </div>
            {actionData?.error && (
              <div className="text-sm text-destructive">{actionData.error}</div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
