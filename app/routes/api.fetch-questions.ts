import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { db } from "firebase"; // Adjust this import based on your Firebase setup
import { collection, getDocs, query, where } from "firebase/firestore";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const surveyId = url.searchParams.get("surveyId");

  if (!surveyId) {
    return json({ error: "Survey ID is required" }, { status: 400 });
  }

  try {
    const questionsRef = collection(db, "surveys", surveyId, "questions");
    const questionsSnapshot = await getDocs(questionsRef);
    
    const questions = questionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return json({ error: "Failed to fetch questions" }, { status: 500 });
  }
};
