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
import { User } from "~/models/types";
import { toast } from "~/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

interface AgentFormProps {
  agentToEdit: User | undefined;
  isCreating: boolean;
  setIsCreating: (value: boolean) => void;
  editingId: string | null;
  setEditingId: (value: string | null) => void;
  isSheetOpen: boolean;
  setIsSheetOpen: (value: boolean) => void;
}

export function AgentForm({
  agentToEdit,
  isCreating,
  setIsCreating,
  editingId,
  setEditingId,
  isSheetOpen,
  setIsSheetOpen,
}: AgentFormProps) {
  const navigation = useNavigation();
  const actionData = useActionData<{ success: boolean; message: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (actionData && actionData.success) {
      setIsSheetOpen(false);
      toast({
        title: actionData.message,
        variant: actionData.success ? "default" : "destructive",
      });
    }
  }, [actionData, setIsSheetOpen]);

  const handleSubmit = (event: React.FormEvent) => {
    if (isCreating && password !== confirmPassword) {
      event.preventDefault();
      setPasswordError('Las contraseñas no coinciden.');
    } else {
      setPasswordError('');
    }
  };

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
          + Agregar Agente
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {isCreating ? "Crear Nuevo Agente" : "Editar Agente"}
          </SheetTitle>
        </SheetHeader>
        <Form method="post" className="space-y-4" onSubmit={handleSubmit}>
          <fieldset disabled={navigation.state === "submitting"}>
            <input
              type="hidden"
              name="action"
              value={isCreating ? "create" : "edit"}
            />
            {!isCreating && (
              <input type="hidden" name="id" value={editingId || ""} />
            )}
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage
                  src={agentToEdit?.profilePictureUrl || undefined}
                  alt="Profile picture"
                />
                <AvatarFallback>{agentToEdit?.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
            </div>

            <div className="mb-4">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={agentToEdit?.name || ""}
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                defaultValue={agentToEdit?.email || ""}
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="phoneNumber">Teléfono</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                required
                defaultValue={agentToEdit?.phoneNumber || ""}
              />
            </div>
            {isCreating && (
              <>
                <div className="mb-4">
                  <Label htmlFor="password">Contraseña Inicial</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                {passwordError && (
                  <p className="text-red-500">{passwordError}</p>
                )}
              </>
            )}
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
