import { useState, useEffect } from "react";
import {
  useLoaderData,
  Form,
  useActionData,
  json,
  useNavigation,
  useParams,
  redirect,
} from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { Survey, Question } from "~/models/types";
import {
  fetchDocument,
  updateDocument,
  createDocument,
  fetchDocuments,
} from "~/services/firestore.server";
import { toast } from "~/hooks/use-toast";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export const loader: LoaderFunction = async ({ params }) => {
  const { id } = params;
  if (id === "new") {
    return { survey: null, questions: [] };
  }
  const survey = await fetchDocument<Survey>("surveys", id as string);
  const questions = await fetchDocuments<Question>("questions", [
    "surveyId",
    "==",
    id as string,
  ]);
  return { survey, questions };
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const { id } = params;
  const isNew = id === "new";

  const surveyData: Partial<Survey> = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    videoUrl: formData.get("videoUrl") as string,
    deadline: new Date(formData.get("deadline") as string),
    cardId: formData.get("cardId") as string,
    rewardedPoints: Number(formData.get("rewardedPoints")),
    status: formData.get("status") as "active" | "inactive" | "completed",
  };

  const questions: Question[] = JSON.parse(formData.get("questions") as string);

  try {
    let surveyId: string;
    if (isNew) {
      const [errors, createdSurvey] = await createDocument<Survey>("surveys", {
        ...surveyData,
        createdAt: new Date(),
      } as Survey);
      if (errors) throw new Error(errors);
      surveyId = createdSurvey;
    } else {
      await updateDocument<Survey>("surveys", id as string, surveyData);
      surveyId = id as string;
    }

    // Handle questions (create, update, or delete)
    for (const question of questions) {
      if (question.id.startsWith("new")) {
        await createDocument<Question>("questions", { ...question, surveyId });
      } else {
        await updateDocument<Question>("questions", question.id, question);
      }
    }

    return redirect("/surveys");
  } catch (error) {
    console.error("Error handling action:", error);
    return json({
      success: false,
      message: "An error occurred. Please try again.",
    });
  }
};

export default function SurveyDetail() {
  const { survey, questions: initialQuestions } = useLoaderData<{
    survey: Survey | null;
    questions: Question[];
  }>();
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  const { id } = useParams();
  const isNew = id === "new";

  useEffect(() => {
    if (actionData?.success === false) {
      toast({
        title: actionData.message,
        variant: "destructive",
      });
    }
  }, [actionData]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `new-${Date.now()}`,
        surveyId: survey?.id || "",
        text: "",
        type: "multiple_choice",
        options: [],
        required: false,
      },
    ]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">
        {isNew ? "Create New Survey" : "Edit Survey"}
      </h1>
      <Form method="post" className="space-y-4">
        <input
          type="hidden"
          name="questions"
          value={JSON.stringify(questions)}
        />

        {/* Survey fields */}
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            defaultValue={survey?.title}
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={survey?.description}
            required
          />
        </div>

        <div>
          <Label htmlFor="videoUrl">Video URL</Label>
          <Input
            id="videoUrl"
            name="videoUrl"
            defaultValue={survey?.videoUrl}
          />
        </div>

        <div>
          <Label htmlFor="deadline">Deadline</Label>
          <Input
            id="deadline"
            name="deadline"
            type="datetime-local"
            defaultValue={
              survey?.deadline
                ? new Date(survey.deadline).toISOString().slice(0, 16)
                : ""
            }
            required
          />
        </div>

        <div>
          <Label htmlFor="cardId">Card ID</Label>
          <Input
            id="cardId"
            name="cardId"
            defaultValue={survey?.cardId}
            required
          />
        </div>

        <div>
          <Label htmlFor="rewardedPoints">Rewarded Points</Label>
          <Input
            id="rewardedPoints"
            name="rewardedPoints"
            type="number"
            defaultValue={survey?.rewardedPoints}
            required
          />
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={survey?.status}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Questions */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Questions</h2>
          {questions.map((question, index) => (
            <div key={question.id} className="border p-4 mb-4 rounded">
              <Input
                value={question.text}
                onChange={(e) => updateQuestion(index, "text", e.target.value)}
                placeholder="Question text"
                className="mb-2"
              />
              <Select
                value={question.type}
                onValueChange={(value) => updateQuestion(index, "type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Question type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple_choice">
                    Multiple Choice
                  </SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
              {question.type === "multiple_choice" && (
                <div className="mt-2">
                  {question.options?.map((option, optionIndex) => (
                    <Input
                      key={optionIndex}
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...question.options!];
                        newOptions[optionIndex] = e.target.value;
                        updateQuestion(index, "options", newOptions);
                      }}
                      placeholder={`Option ${optionIndex + 1}`}
                      className="mb-2"
                    />
                  ))}
                  <Button
                    type="button"
                    onClick={() => {
                      const newOptions = [...(question.options || []), ""];
                      updateQuestion(index, "options", newOptions);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Add Option
                  </Button>
                </div>
              )}
              <Button
                type="button"
                onClick={() => removeQuestion(index)}
                variant="destructive"
                size="sm"
                className="mt-2"
              >
                Remove Question
              </Button>
            </div>
          ))}
          <Button type="button" onClick={addQuestion} variant="outline">
            Add Question
          </Button>
        </div>

        <Button type="submit" disabled={navigation.state === "submitting"}>
          {navigation.state === "submitting"
            ? "Saving..."
            : isNew
            ? "Create Survey"
            : "Update Survey"}
        </Button>
      </Form>
    </div>
  );
}
