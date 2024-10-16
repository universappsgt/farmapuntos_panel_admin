import { useState, useEffect } from "react";
import { Form, useNavigation, useActionData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { Survey, Question } from "~/models/types";
import { toast } from "~/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { CalendarIcon, PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { cn } from "~/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface SurveyFormProps {
  surveyToEdit: Survey | undefined;
  isCreating: boolean;
  setIsCreating: (value: boolean) => void;
  editingId: string | null;
  setEditingId: (value: string | null) => void;
  isSheetOpen: boolean;
  setIsSheetOpen: (value: boolean) => void;
}

export function SurveyForm({
  surveyToEdit,
  isCreating,
  setIsCreating,
  editingId,
  setEditingId,
  isSheetOpen,
  setIsSheetOpen,
}: SurveyFormProps) {
  const navigation = useNavigation();
  const actionData = useActionData<{ success: boolean; message: string }>();

  useEffect(() => {
    if (actionData && actionData.success) {
      setIsSheetOpen(false);
      toast({
        title: actionData.message,
        variant: actionData.success ? "default" : "destructive",
      });
    }
  }, [actionData, setIsSheetOpen]);

  const [date, setDate] = useState<Date | undefined>(undefined);

  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (surveyToEdit) {
      setDate(surveyToEdit.deadline);
    } else {
      setDate(undefined);

      setQuestions([]);
    }
  }, [surveyToEdit]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        text: "",
        type: "text",
        surveyId: editingId || "",
        required: false,
      },
    ]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, field: keyof Question, value: string) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button
          className="mb-4"
          onClick={() => {
            setIsCreating(true);
            setEditingId(null);
            setIsSheetOpen(true);
            setQuestions([]);
          }}
        >
          + Agregar
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {isCreating ? "Crear Nueva Encuesta" : "Editar Encuesta"}
          </SheetTitle>
        </SheetHeader>
        <Form method="post" className="space-y-4">
          <fieldset disabled={navigation.state === "submitting"}>
            <input
              type="hidden"
              name="action"
              value={isCreating ? "create" : "edit"}
            />
            {!isCreating && (
              <input type="hidden" name="id" value={editingId || ""} />
            )}
            <div className="mb-4">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                name="title"
                required
                defaultValue={isCreating ? "" : surveyToEdit?.title}
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                required
                defaultValue={isCreating ? "" : surveyToEdit?.description}
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="cardId">ID de Tarjeta</Label>
              <Input
                id="cardId"
                name="cardId"
                required
                defaultValue={isCreating ? "" : surveyToEdit?.cardId}
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="deadline">Fecha Límite</Label>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label htmlFor="date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex-1">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={
                      date
                        ? date.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })
                        : ""
                    }
                    onChange={(e) => undefined}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <Label htmlFor="status">Estado</Label>
              <Select
                name="status"
                required
                defaultValue={isCreating ? "" : surveyToEdit?.status}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mb-4">
              <Label htmlFor="videoUrl">URL del Video</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="videoUrl"
                  name="videoUrl"
                  defaultValue={isCreating ? "" : surveyToEdit?.videoUrl}
                  className="flex-grow"
                />
                {surveyToEdit?.videoUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.open(surveyToEdit.videoUrl, "_blank")}
                  >
                    Abrir
                  </Button>
                )}
              </div>
              {surveyToEdit?.videoUrl && (
                <div className="mt-2">
                  <Label>Video Preview</Label>
                  <div className="aspect-video mt-1">
                    <iframe
                      src={surveyToEdit.videoUrl}
                      title="Video preview"
                      className="w-full h-full border-0"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}
            </div>
            <div className="mb-4">
              <Label>Preguntas</Label>
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="flex items-center space-x-2 mb-2"
                >
                  <Input
                    value={question.text}
                    onChange={(e) =>
                      updateQuestion(question.id, "text", e.target.value)
                    }
                    placeholder={`Pregunta ${index + 1}`}
                  />
                  <Select
                    value={question.type}
                    onValueChange={(value) =>
                      updateQuestion(question.id, "type", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Texto</SelectItem>
                      <SelectItem value="multipleChoice">
                        Opción múltiple
                      </SelectItem>
                      <SelectItem value="checkbox">
                        Casilla de verificación
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    onClick={() => removeQuestion(question.id)}
                    variant="destructive"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                onClick={addQuestion}
                type="button"
                variant="outline"
                className="mt-2"
              >
                <PlusIcon className="mr-2 h-4 w-4" /> Añadir Pregunta
              </Button>
            </div>
            <SheetFooter>
              <Button type="submit">
                {navigation.state === "submitting"
                  ? "Procesando..."
                  : isCreating
                  ? "Crear"
                  : "Guardar"}
              </Button>
            </SheetFooter>
          </fieldset>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
