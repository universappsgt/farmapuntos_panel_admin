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
import { Reward } from "~/models/types";
import { toast } from "~/hooks/use-toast";
import { Card, CardContent } from "~/components/ui/card";
import { ImageUpload } from "~/components/custom/image-upload";

interface RewardFormProps {
  rewardToEdit: Reward | undefined;
  isCreating: boolean;
  setIsCreating: (value: boolean) => void;
  editingId: string | null;
  setEditingId: (value: string | null) => void;
  isSheetOpen: boolean;
  setIsSheetOpen: (value: boolean) => void;
}

export function RewardForm({
  rewardToEdit,
  isCreating,
  setIsCreating,
  editingId,
  setEditingId,
  isSheetOpen,
  setIsSheetOpen,
}: RewardFormProps) {
  const navigation = useNavigation();
  const actionData = useActionData<{ success: boolean; message: string }>();
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (actionData && actionData.success) {
      setIsSheetOpen(false);
      toast({
        title: actionData.message,
        variant: actionData.success ? "default" : "destructive",
      });
    }
  }, [actionData, setIsSheetOpen]);

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button
          className="mb-4"
          onClick={() => {
            setIsCreating(true);
            setEditingId(null);
          }}
        >
          + Agregar Recompensa
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {isCreating ? "Crear Nueva Recompensa" : "Editar Recompensa"}
          </SheetTitle>
        </SheetHeader>
        <Form method="post" className="space-y-4" encType="multipart/form-data">
          <fieldset disabled={navigation.state === "submitting"}>
            <input
              type="hidden"
              name="action"
              value={isCreating ? "create" : "edit"}
            />
            {!isCreating && (
              <input type="hidden" name="id" value={editingId || ""} />
            )}
            {!isCreating && rewardToEdit?.imageUrl && (
              <input
                type="hidden"
                name="currentImageUrl"
                value={rewardToEdit.imageUrl}
              />
            )}
            <div className="mb-4">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={rewardToEdit?.name || ""}
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="imageUrl">Imagen</Label>
              <Card className="mt-2">
                <CardContent className="p-4">
                  {imageFile || rewardToEdit?.imageUrl ? (
                    <img
                      src={
                        imageFile
                          ? URL.createObjectURL(imageFile)
                          : rewardToEdit?.imageUrl
                      }
                      alt="Image Preview"
                      className="w-full h-40 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-full h-40 bg-muted flex items-center justify-center rounded-md">
                      Sin imagen
                    </div>
                  )}
                </CardContent>
              </Card>
              <ImageUpload
                id="imageUrl"
                name="imageUrl"
                onImageUpload={(file) => setImageFile(file)}
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="expirationDate">Fecha de Vencimiento</Label>
              <Input
                id="expirationDate"
                name="expirationDate"
                type="date"
                required
                defaultValue={
                  rewardToEdit?.expirationDate.toISOString().split("T")[0] || ""
                }
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="awardedPoints">Puntos Requeridos</Label>
              <Input
                id="awardedPoints"
                name="awardedPoints"
                type="number"
                required
                defaultValue={rewardToEdit?.awardedPoints || 0}
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="stock">Existencias</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                required
                defaultValue={rewardToEdit?.stock || 0}
              />
            </div>
            <SheetFooter>
              <Button type="submit">
                {navigation.state === "submitting"
                  ? "Guardando..."
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
