import { useEffect, useState } from "react";
import {
  useLoaderData,
  Form,
  useActionData,
  json,
  useNavigation,
} from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { Survey } from "~/models/types";
import {
  createDocument,
  deleteDocument,
  fetchDocuments,
  updateDocument,
} from "~/services/firestoreService";
import { toast } from "~/hooks/use-toast";
import { DataTable } from "~/components/ui/data-table";
import { surveyColumns } from "~/components/custom/columns";
import { SurveyForm } from "~/lib/features/surveys/survey-form";

export const loader: LoaderFunction = async () => {
  const surveys: Survey[] = await fetchDocuments<Survey>("surveys");
  return { surveys };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("action");

  try {
    switch (action) {
      case "create": {
        const title = formData.get("title");
        const description = formData.get("description");
        const survey: Survey = {
          title: title as string,
          description: description as string,
          cardId: "",
          deadline: "",
          rewardedPoints: 0,
          status: "",
          videoUrl: "",
          createdAt: new Date().toISOString(),
          id: "",
        };

        const [errors, createdSurvey] = await createDocument<Survey>(
          "surveys",
          survey
        );
        if (errors) {
          const values = Object.fromEntries(formData);
          return json({ errors, values });
        }
        return json({
          success: true,
          message: "Survey created successfully!",
        });
      }
      case "edit": {
        const id = formData.get("id");
        const title = formData.get("title");
        const description = formData.get("description");
        const survey: Survey = {
          title: title as string,
          description: description as string,
          cardId: "",
          deadline: "",
          rewardedPoints: 0,
          status: "",
          videoUrl: "",
          createdAt: formData.get("createdAt") as string,
          id: id as string,
        };

        await updateDocument<Survey>("surveys", id as string, survey);
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
  const { surveys } = useLoaderData<{ surveys: Survey[] }>();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const navigation = useNavigation();

  const actionData = useActionData<typeof action>();

  useEffect(() => {
    if (actionData && actionData.success) {
      setIsSheetOpen(false);
      toast({
        title: actionData.message,
        variant: actionData.success ? "default" : "destructive",
      });
    }
  }, [actionData]);

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Surveys</h1>
      <SurveyForm
        isSheetOpen={isSheetOpen}
        setIsSheetOpen={setIsSheetOpen}
        surveys={surveys}
        isCreating={isCreating}
        setIsCreating={setIsCreating}
        editingId={editingId}
        setEditingId={setEditingId}
      />

      <DataTable
        columns={surveyColumns({
          editAction: (id) => {
            setIsCreating(false);
            setEditingId(id);
            setIsSheetOpen(true);
          },
          navigation,
        })}
        data={surveys}
      />
    </div>
  );
}
