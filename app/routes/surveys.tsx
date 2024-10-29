import { useEffect, useState } from "react";
import {
  useLoaderData,
  Form,
  useActionData,
  json,
  useNavigation,
} from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { Survey, Question, FidelityCard } from "~/models/types";
import {
  deleteDocument,
  fetchDocuments,
  updateDocument,
} from "~/services/firestore.server";
import { toast } from "sonner";
import { DataTable } from "~/components/ui/data-table";
import { surveyColumns } from "~/components/custom/columns";
import { SurveyForm } from "~/lib/features/surveys/survey-form";
import { db } from "firebase";
import { collection, addDoc, writeBatch, doc } from "firebase/firestore";

export const loader: LoaderFunction = async () => {
  const [surveys, cards] = await Promise.all([
    fetchDocuments<Survey>("surveys"),
    fetchDocuments<FidelityCard>("cards"),
  ]);
  return { surveys, cards };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("action");

  try {
    switch (action) {
      case "create": {
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const cardId = formData.get("cardId") as string;
        const deadline = new Date(formData.get("deadline") as string);
        const status = formData.get("status") as string;
        const videoUrl = formData.get("videoUrl") as string;
        const questionsJson = formData.get("questions") as string;
        const questions = JSON.parse(questionsJson) as Question[];
        const minimumPassingPercentage = parseInt(formData.get("minimumPassingPercentage") as string);
        const worthPoints = parseInt(formData.get("worthPoints") as string);

        // 1. Create the survey in the surveys collection
        const surveysRef = collection(db, "surveys");
        const newSurveyRef = await addDoc(surveysRef, {
          title,
          description,
          cardId,
          deadline,
          status,
          videoUrl,
          createdAt: new Date(),
          minimumPassingPercentage,
          worthPoints,
          awardedPoints: 0,
        });

        // 2. Batch create questions in the survey subcollection
        const batch = writeBatch(db);
        const questionsRef = collection(
          db,
          `surveys/${newSurveyRef.id}/questions`
        );

        questions.forEach((question) => {
          const newQuestionRef = doc(questionsRef);
          batch.set(newQuestionRef, {
            ...question,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        });

        await batch.commit();

        return json({
          success: true,
          message: "Survey created successfully!",
        });
      }
      case "edit": {
        const id = formData.get("id");
        const title = formData.get("title");
        const description = formData.get("description");
        const cardId = formData.get("cardId");
        const deadline = new Date(formData.get("deadline") as string);
        const status = formData.get("status") as
          | "active"
          | "inactive"
          | "completed";
        const videoUrl = formData.get("videoUrl") as string;
        const awardedPoints = parseInt(formData.get("awardedPoints") as string);
        const questionsJson = formData.get("questions") as string;
        const questions = JSON.parse(questionsJson) as Question[];
        const minimumPassingPercentage = parseInt(formData.get("minimumPassingPercentage") as string);
        const worthPoints = parseInt(formData.get("worthPoints") as string);

        const survey: Survey = {
          id: id as string,
          title: title as string,
          description: description as string,
          cardId: cardId as string,
          deadline,
          status,
          videoUrl,
          minimumPassingPercentage,
          worthPoints,
          awardedPoints,
          createdAt: new Date(),
        };

        // 1. Update the survey document
        await updateDocument<Survey>("surveys", id as string, survey);

        // 2. Update questions in the survey subcollection
        const batch = writeBatch(db);
        const questionsRef = collection(db, `surveys/${id}/questions`);

        // First delete existing questions
        const existingQuestions = await fetchDocuments<Question>(
          `surveys/${id}/questions`
        );
        existingQuestions.forEach((question) => {
          const questionRef = doc(questionsRef, question.id);
          batch.delete(questionRef);
        });

        // Then create new questions
        questions.forEach((question) => {
          const newQuestionRef = doc(questionsRef);
          batch.set(newQuestionRef, {
            ...question,
            updatedAt: new Date(),
          });
        });

        await batch.commit();

        return json({
          success: true,
          message: "Survey updated successfully!",
        });
      }
      case "delete": {
        const id = formData.get("id");
        await deleteDocument("surveys", id as string);
        return json({
          success: true,
          message: "Survey deleted successfully!",
        });
      }
    }
  } catch (error) {
    console.error("Error handling action:", error);
    return json({
      success: false,
      message: "An error occurred. Please try again.",
    });
  }
};

export default function Surveys() {
  const { surveys, cards } = useLoaderData<{
    surveys: Survey[];
    cards: FidelityCard[];
  }>();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const navigation = useNavigation();

  const actionData = useActionData<typeof action>();

  // convert surveys to have date objects
  const surveysWithDates = surveys.map((survey) => ({
    ...survey,
    deadline: new Date(survey.deadline),
    createdAt: new Date(survey.createdAt),
  }));

  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        toast.success(actionData.message, {
          duration: 3000,
          className: "bg-background border-green-500",
          position: "bottom-right",
          icon: "✅",
          style: {
            color: "hsl(var(--foreground))",
          },
        });
      } else {
        toast.error(actionData.message, {
          duration: 3000,
          className: "bg-background border-destructive",
          position: "bottom-right",
          icon: "❌",
          style: {
            color: "hsl(var(--foreground))",
          },
        });
      }
    }
  }, [actionData]);

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Encuestas</h1>
      <SurveyForm
        isSheetOpen={isSheetOpen}
        setIsSheetOpen={setIsSheetOpen}
        surveyToEdit={getSurveyToEdit()}
        isCreating={isCreating}
        setIsCreating={setIsCreating}
        editingId={editingId}
        setEditingId={setEditingId}
        cards={cards}
      />
      <DataTable
        columns={surveyColumns({
          editAction: (id: string) => {
            setIsCreating(false);
            setEditingId(id);
            setIsSheetOpen(true);
          },
          navigation,
        })}
        data={surveysWithDates}
        filterColumn="title"
      />
    </div>
  );

  function getSurveyToEdit() {
    return surveysWithDates.find((survey) => survey.id === editingId);
  }
}
