import { auth } from "../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getSessionUser } from "./sessions.server";

export async function loginUser(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    throw new Error("Login failed: " + error);
  }
}

export async function logoutUser() {
  try {
    await auth.signOut();
  } catch (error) {
    throw new Error("Logout failed: " + error);
  }
}

export async function getCurrentUser(request?: Request) {
  // Si hay un request, usar la sesión del servidor
  if (request) {
    return await getSessionUser(request);
  }
  // Si no hay request, intentar usar auth.currentUser (para compatibilidad)
  return auth.currentUser;
}
