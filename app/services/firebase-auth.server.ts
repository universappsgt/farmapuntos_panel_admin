import { auth } from "../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

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


export async function getCurrentUser() {
  return auth.currentUser;
}
