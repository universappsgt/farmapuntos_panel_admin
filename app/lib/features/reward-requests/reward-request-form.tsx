import { useState, useEffect } from "react";
import { Form, useNavigation, useActionData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import {
  RewardRequest,
  RewardRequestStatus,
} from "~/models/types";
import { toast } from "~/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface RewardRequestFormProps {
  rewardRequestToEdit: RewardRequest | undefined;
  editingId: string | null;
  setEditingId: (value: string | null) => void;
  isSheetOpen: boolean;
  setIsSheetOpen: (value: boolean) => void;
}

export function RewardRequestForm({
  rewardRequestToEdit,
  editingId,
  setEditingId,
  isSheetOpen,
  setIsSheetOpen,
}: RewardRequestFormProps) {
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

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Editar Solicitud de Canjeo</SheetTitle>
        </SheetHeader>
        <Form method="post" className="space-y-4">
          <fieldset disabled={navigation.state === "submitting"}>
            <input type="hidden" name="action" value="edit" />
            <input type="hidden" name="id" value={editingId || ""} />
            
            <div className="mb-4">
              <Label>Usuario</Label>
              <div>{rewardRequestToEdit?.user.name || "N/A"}</div>
            </div>
            
            <div className="mb-4">
              <Label>Recompensa</Label>
              <div>{rewardRequestToEdit?.reward.name || "N/A"}</div>
            </div>
            
            <div className="mb-4">
              <Label>Puntos Requeridos</Label>
              <div>{rewardRequestToEdit?.reward.awardedPoints || 0}</div>
            </div>
            
            <div className="mb-4">
              <Label>Fecha de Solicitud</Label>
              <div>
                {rewardRequestToEdit?.createdAt
                  ? new Date(rewardRequestToEdit.createdAt).toLocaleString()
                  : "N/A"}
              </div>
            </div>

            <div className="mb-4">
              <Label htmlFor="status">Estado de la Solicitud</Label>
              <Select
                name="status"
                defaultValue={rewardRequestToEdit?.status || RewardRequestStatus.Requested}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(RewardRequestStatus).filter((value): value is RewardRequestStatus => 
                    typeof value === 'string'
                  ).map((status) => (
                    <SelectItem key={status} value={status}>
                      {RewardRequestStatus.getName(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <SheetFooter>
              <Button type="submit">
                {navigation.state === "submitting"
                  ? "Guardando..."
                  : "Guardar"}
              </Button>
            </SheetFooter>
          </fieldset>
        </Form>
      </SheetContent>
    </Sheet>
  );
} 