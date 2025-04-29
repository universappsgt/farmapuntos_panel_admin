import { useState, useEffect, useCallback } from "react";
import {
  Form,
  useNavigation,
  useActionData,
  useFetcher,
} from "@remix-run/react";
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
import { Survey, Question, FidelityCard } from "~/models/types";
import { toast } from "~/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { CalendarIcon } from "@radix-ui/react-icons";
import { cn } from "~/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import QuestionList from "./question-editor";

interface SurveyFormProps {
  surveyToEdit: Survey | undefined;
  isCreating: boolean;
  setIsCreating: (value: boolean) => void;
  editingId: string | null;
  setEditingId: (value: string | null) => void;
  isSheetOpen: boolean;
  setIsSheetOpen: (value: boolean) => void;
  cards: FidelityCard[];
}

export function SurveyForm({
  surveyToEdit,
  isCreating,
  setIsCreating,
  editingId,
  setEditingId,
  isSheetOpen,
  setIsSheetOpen,
  cards,
}: SurveyFormProps) {
  const navigation = useNavigation();
  const actionData = useActionData<{ success: boolean; message: string }>();
  const questionsFetcher = useFetcher();

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [time, setTime] = useState<string>("00:00");

  // Reset form state when sheet is closed
  const handleSheetOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        setQuestions([]);
        setDate(undefined);
        setTime("00:00");
      }
      setIsSheetOpen(open);
    },
    [setIsSheetOpen]
  );

  // Handle survey to edit changes
  useEffect(() => {
    if (surveyToEdit) {
      const deadline = new Date(surveyToEdit.deadline);
      setDate(deadline);
      setTime(
        deadline.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    }
  }, [surveyToEdit]);

  // Handle questions fetching
  useEffect(() => {
    if (isSheetOpen && !isCreating && editingId) {
      questionsFetcher.load(`/api/fetch-questions?surveyId=${editingId}`);
    }
  }, [isSheetOpen, isCreating, editingId, questionsFetcher]);

  // Update questions when fetcher returns data
  useEffect(() => {
    if (questionsFetcher.state === "idle" && questionsFetcher.data) {
      setQuestions(questionsFetcher.data as Question[]);
    }
  }, [questionsFetcher.state, questionsFetcher.data]);

  const handleQuestionsChange = useCallback((updatedQuestions: Question[]) => {
    setQuestions(updatedQuestions);
  }, []);

  // Combine date and time into a single deadline
  const getDeadline = useCallback(() => {
    if (!date) return null;
    
    const [hours, minutes] = time.split(':').map(Number);
    const deadline = new Date(date);
    deadline.setHours(hours, minutes);
    return deadline;
  }, [date, time]);

  return (
    <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
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
      <SheetContent
        side="right"
        className="w-[50vw] sm:max-w-[50vw] overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>
            {isCreating ? "Crear Nueva Encuesta" : "Editar Encuesta"}
          </SheetTitle>
        </SheetHeader>
        <Form method="post" action="/surveys" className="space-y-4">
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
              <Label htmlFor="cardId">Tarjeta de Fidelidad</Label>
              <Select
                name="cardId"
                required
                defaultValue={isCreating ? "" : surveyToEdit?.cardId}
                disabled={isLoadingCards}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isLoadingCards
                        ? "Cargando tarjetas..."
                        : "Selecciona una tarjeta"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {cards.map((card) => (
                    <SelectItem key={card.id} value={card.id}>
                      {card.cardTitle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                        {date ? format(date, "PPP") : <span>Seleccionar fecha</span>}
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
                  <Label htmlFor="time">Hora</Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
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
                  <SelectValue placeholder="Seleccionar estado" />
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
            </div>
            <div className="mb-4">
              <Label htmlFor="minimumPassingPercentage">Porcentaje Mínimo de Aprobación (%)</Label>
              <Input
                id="minimumPassingPercentage"
                name="minimumPassingPercentage"
                type="number"
                min="0"
                max="100"
                required
                defaultValue={isCreating ? "60" : surveyToEdit?.minimumPassingPercentage}
              />
            </div>

            <div className="mb-4">
              <Label htmlFor="worthPoints">Puntos a Ganar</Label>
              <Input
                id="worthPoints"
                name="worthPoints"
                type="number"
                min="0"
                required
                defaultValue={isCreating ? "0" : surveyToEdit?.worthPoints}
              />
            </div>

            <QuestionList
              initialQuestions={questions}
              onQuestionsChange={handleQuestionsChange}
            />
            <input
              type="hidden"
              name="questions"
              value={JSON.stringify(questions)}
            />
            <input
              type="hidden"
              name="deadline"
              value={getDeadline()?.toISOString() || ""}
            />
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
