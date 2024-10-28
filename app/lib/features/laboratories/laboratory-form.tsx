import { useState, useEffect } from "react";
import { Form, useNavigation, useActionData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { Laboratory } from "~/models/types";
import { toast } from "~/hooks/use-toast";

interface LaboratoryFormProps {
  laboratories: Laboratory[];
  isCreating: boolean;
  setIsCreating: (value: boolean) => void;
  editingId: string | null;
  setEditingId: (value: string | null) => void;
  isSheetOpen: boolean;
  setIsSheetOpen: (value: boolean) => void;
}

export function LaboratoryForm({
  laboratories,
  isCreating,
  setIsCreating,
  editingId,
  setEditingId,
  isSheetOpen,
  setIsSheetOpen,
}: LaboratoryFormProps) {
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

  const laboratoryToEdit = laboratories.find((lab) => lab.id === editingId);

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button
          className="mb-4"
          onClick={() => {
            setIsCreating(true);
            setEditingId(null);
            setIsSheetOpen(true);
          }}
        >
          + Agregar Laboratorio
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {isCreating ? "Crear Nuevo Laboratorio" : "Editar Laboratorio"}
          </SheetTitle>
        </SheetHeader>
        <Form method="post" className="space-y-8">
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
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={isCreating ? "" : laboratoryToEdit?.name}
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                name="location"
                required
                defaultValue={isCreating ? "" : laboratoryToEdit?.location}
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="specialization">Especialización</Label>
              <Input
                id="specialization"
                name="specialization"
                required
                defaultValue={
                  isCreating ? "" : laboratoryToEdit?.specialization
                }
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="contactNumber">Teléfono de Contacto</Label>
              <Input
                id="contactNumber"
                name="contactNumber"
                required
                defaultValue={isCreating ? "" : laboratoryToEdit?.contactNumber}
              />
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
