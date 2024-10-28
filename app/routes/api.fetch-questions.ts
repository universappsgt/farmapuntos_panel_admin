import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { db } from "firebase"; // Adjust this import based on your Firebase setup
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const surveyId = url.searchParams.get("surveyId");

  if (!surveyId) {
    return json({ error: "Survey ID is required" }, { status: 400 });
  }

  try {
    const questionsRef = collection(db, "surveys", surveyId, "questions");
    const questionsQuery = query(questionsRef, orderBy("createdAt", "asc")); // Add ordering if needed
    const questionsSnapshot = await getDocs(questionsQuery);
    
    const questions = questionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Add proper error handling if no questions found
    if (questions.length === 0) {
      return json([]);
    }

    return json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return json({ error: "Failed to fetch questions" }, { status: 500 });
  }
};
