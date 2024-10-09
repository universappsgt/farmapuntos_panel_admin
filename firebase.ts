// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { redirect } from "@remix-run/react";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCLkvhx1JLpWbb3eMTE5swdqc5D_jBmN-k",
  authDomain: "becofarma-11a88.firebaseapp.com",
  projectId: "becofarma-11a88",
  storageBucket: "becofarma-11a88.appspot.com",
  messagingSenderId: "322797389024",
  appId: "1:322797389024:web:b2d75d9b1a72ee671bbc85",
  measurementId: "G-MFFW7GZN7S"
};



// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


export async function requireAuth(request: Request) {
  const user = auth.currentUser;
  if (!user) {
    throw redirect('/login');
  }
  return user;
}

export { auth, db };


