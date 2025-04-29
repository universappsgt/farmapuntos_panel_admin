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
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from "~/models/types";
import { toast } from "~/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface TransactionFormProps {
  transactionToEdit: Transaction | undefined;
  isCreating: boolean;
  setIsCreating: (value: boolean) => void;
  editingId: string | null;
  setEditingId: (value: string | null) => void;
  isSheetOpen: boolean;
  setIsSheetOpen: (value: boolean) => void;
}

export function TransactionForm({
  transactionToEdit,
  isCreating,
  setIsCreating,
  editingId,
  setEditingId,
  isSheetOpen,
  setIsSheetOpen,
}: TransactionFormProps) {
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
          <SheetTitle>
            {isCreating ? "Crear Nueva Transacción" : "Editar Transacción"}
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
              <>
                <input type="hidden" name="id" value={editingId || ""} />
                <input
                  type="hidden"
                  name="userId"
                  value={transactionToEdit?.userId || ""}
                />
                <input
                  type="hidden"
                  name="agentId"
                  value={transactionToEdit?.agentId || ""}
                />
                <input
                  type="hidden"
                  name="agentSignatureUrl"
                  value={transactionToEdit?.agentSignatureUrl || ""}
                />
                <input
                  type="hidden"
                  name="userSignatureUrl"
                  value={transactionToEdit?.userSignatureUrl || ""}
                />
                <input
                  type="hidden"
                  name="evidenceImageUrl"
                  value={transactionToEdit?.evidenceImageUrl || ""}
                />
                <input
                  type="hidden"
                  name="points"
                  value={transactionToEdit?.points || 0}
                />
              </>
            )}
            <div className="mb-4">
              <Label>Usuario</Label>
              <div>{transactionToEdit?.user.name || "N/A"}</div>
            </div>
            <div className="mb-4">
              <Label>Agente</Label>
              <div>{transactionToEdit?.agent.name || "N/A"}</div>
            </div>
            <div className="mb-4">
              <Label>Puntos de Recompensa</Label>
              <div>{transactionToEdit?.points || 0}</div>
            </div>
            <div className="mb-4">
              <Label htmlFor="status">
                Estado de la Transacción
              </Label>
              <Select
                name="status"
                defaultValue={
                  transactionToEdit?.status || TransactionStatus.InProgress
                }
                disabled={transactionToEdit?.status === TransactionStatus.Approved}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TransactionStatus).filter((value): value is TransactionStatus => 
                    typeof value === 'string'
                  ).map((status) => (
                    <SelectItem key={status} value={status}>
                      {TransactionStatus.getName(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mb-4">
              <Label htmlFor="type">Tipo de Transacción</Label>
              <Select
                name="type"
                defaultValue={
                  transactionToEdit?.type || TransactionType.Credit
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TransactionType).filter((value): value is TransactionType => 
                    typeof value === 'string'
                  ).map((type) => (
                    <SelectItem key={type} value={type}>
                      {TransactionType.getName(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mb-4">
              <Label>Firma del Agente</Label>
              {transactionToEdit?.agentSignatureUrl && (
                <img
                  src={transactionToEdit.agentSignatureUrl}
                  alt="Firma del Agente"
                  className="w-full h-40 object-cover rounded-md"
                  style={{ objectFit: "contain" }}
                />
              )}
            </div>
            <div className="mb-4">
              <Label>Firma del Cliente</Label>
              {transactionToEdit?.userSignatureUrl && (
                <img
                  src={transactionToEdit.userSignatureUrl}
                  alt="Firma del Cliente"
                  className="w-full h-40 object-cover rounded-md"
                  style={{ objectFit: "contain" }}
                />
              )}
            </div>
            <div className="mb-4">
              <Label>Imagen de Evidencia</Label>
              {transactionToEdit?.evidenceImageUrl && (
                <img
                  src={transactionToEdit.evidenceImageUrl}
                  alt="Evidencia"
                  className="w-full h-40 object-cover rounded-md"
                  style={{ objectFit: "contain" }}
                />
              )}
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
