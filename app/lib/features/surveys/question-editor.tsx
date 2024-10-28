import { useState, useCallback, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Pencil, Trash2, ChevronRight, Plus, Minus } from "lucide-react";
import { Question } from "~/models/types";

interface QuestionListProps {
  initialQuestions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
}

export default function QuestionList({
  initialQuestions,
  onQuestionsChange,
}: QuestionListProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  useEffect(() => {
    onQuestionsChange(questions);
  }, [questions, onQuestionsChange]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedQuestion((prev) => (prev === id ? null : id));
  }, []);

  const handleEdit = useCallback((question: Question) => {
    setEditingQuestion(question);
    setExpandedQuestion(null);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setEditingQuestion((prev) => (prev ? { ...prev, [name]: value } : null));
    },
    []
  );

  const handleAnswerChange = useCallback((index: number, value: string) => {
    setEditingQuestion((prev) => {
      if (!prev) return null;
      const newAnswers = [...prev.answers];
      newAnswers[index] = value;
      return { ...prev, answers: newAnswers };
    });
  }, []);

  const handleCorrectAnswerChange = useCallback((index: number) => {
    setEditingQuestion((prev) =>
      prev ? { ...prev, correctAnswerIndex: index } : null
    );
  }, []);

  const addAnswer = useCallback(() => {
    setEditingQuestion((prev) => {
      if (!prev) return null;
      return { ...prev, answers: [...prev.answers, ""] };
    });
  }, []);

  const removeAnswer = useCallback((index: number) => {
    setEditingQuestion((prev) => {
      if (!prev) return null;
      const newAnswers = prev.answers.filter((_, i) => i !== index);
      const newCorrectAnswerIndex =
        prev.correctAnswerIndex >= index
          ? Math.max(0, prev.correctAnswerIndex - 1)
          : prev.correctAnswerIndex;
      return {
        ...prev,
        answers: newAnswers,
        correctAnswerIndex: newCorrectAnswerIndex,
      };
    });
  }, []);

  const handleSave = useCallback(() => {
    if (editingQuestion) {
      setQuestions((prevQuestions) => {
        const index = prevQuestions.findIndex((q) => q.id === editingQuestion.id);
        if (index !== -1) {
          const newQuestions = [...prevQuestions];
          newQuestions[index] = editingQuestion;
          return newQuestions;
        } else {
          return [...prevQuestions, editingQuestion];
        }
      });
      setEditingQuestion(null);
    }
  }, [editingQuestion]);

  const handleCancel = useCallback(() => {
    setEditingQuestion(null);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setQuestions((prevQuestions) => prevQuestions.filter((q) => q.id !== id));
  }, []);

  const addNewQuestion = useCallback(() => {
    const newQuestion: Question = {
      id: `new-${Date.now()}`,
      questionText: "",
      correctAnswer: "",
      correctAnswerIndex: 0,
      answers: ["", ""],
    };
    setEditingQuestion(newQuestion);
  }, []);

  return (
    <div className="space-y-4 pb-4">
      <h2 className="text-xl font-semibold">Preguntas</h2>
      {questions.map((question) => (
        <Card key={question.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => toggleExpand(question.id)}
                className="flex items-center space-x-2 text-left flex-grow"
                aria-expanded={expandedQuestion === question.id}
                aria-controls={`question-${question.id}-content`}
              >
                <ChevronRight
                  className={`h-4 w-4 transition-transform ${
                    expandedQuestion === question.id
                      ? "transform rotate-90"
                      : ""
                  }`}
                />
                <span className="font-medium truncate">
                  {question.questionText}
                </span>
              </button>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(question)}
                >
                  <Pencil className="w-4 h-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(question.id)}
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>
            {expandedQuestion === question.id && (
              <div id={`question-${question.id}-content`} className="mt-2 pl-6">
                <ul className="list-disc list-inside space-y-1">
                  {question.answers.map((answer, index) => (
                    <li
                      key={index}
                      className={`text-sm ${
                        index === question.correctAnswerIndex
                          ? "font-bold text-green-600 dark:text-green-400"
                          : ""
                      }`}
                    >
                      {answer}
                      {index === question.correctAnswerIndex && (
                        <span className="ml-2">(Correct)</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      <Button onClick={addNewQuestion} variant="outline">
        <Plus className="h-4 w-4 mr-2" />
        Agregar Nueva Pregunta
      </Button>
      {editingQuestion && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingQuestion.id.startsWith("new-") ? "Agregar Nueva Pregunta" : "Editar Pregunta"}
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="questionText">Texto de la Pregunta</Label>
                <Textarea
                  id="questionText"
                  name="questionText"
                  value={editingQuestion.questionText}
                  onChange={handleInputChange}
                  className="mt-1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Respuestas</Label>
                <RadioGroup
                  value={editingQuestion.correctAnswerIndex.toString()}
                  onValueChange={(value) =>
                    handleCorrectAnswerChange(parseInt(value))
                  }
                >
                  {editingQuestion.answers.map((answer, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={index.toString()}
                        id={`answer-${index}`}
                      />
                      <Input
                        value={answer}
                        onChange={(e) =>
                          handleAnswerChange(index, e.target.value)
                        }
                        className="flex-grow"
                        placeholder={`Respuesta ${index + 1}`}
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeAnswer(index)}
                        disabled={editingQuestion.answers.length <= 2}
                      >
                        <Minus className="h-4 w-4" />
                        <span className="sr-only">Remove answer</span>
                      </Button>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <Button type="button" variant="outline" onClick={addAnswer}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Respuesta
              </Button>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>Guardar Cambios</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
