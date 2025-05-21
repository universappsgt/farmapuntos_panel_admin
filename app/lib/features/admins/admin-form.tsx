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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface AdminFormProps {
  adminToEdit: User | undefined;
  isCreating: boolean;
  setIsCreating: (value: boolean) => void;
  editingId: string | null;
  setEditingId: (value: string | null) => void;
  isSheetOpen: boolean;
  setIsSheetOpen: (value: boolean) => void;
}

export function AdminForm({
  adminToEdit,
  isCreating,
  setIsCreating,
  editingId,
  setEditingId,
  isSheetOpen,
  setIsSheetOpen,
}: AdminFormProps) {
  const navigation = useNavigation();
  const actionData = useActionData<{ success: boolean; message: string }>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (actionData && actionData.success) {
      setIsSheetOpen(false);
      toast({
        title: actionData.message,
        variant: actionData.success ? "default" : "destructive",
      });
    }
  }, [actionData, setIsSheetOpen]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (e.target.value !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
    } else {
      setPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (e.target.value !== password) {
      setPasswordError("Las contraseñas no coinciden");
    } else {
      setPasswordError("");
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
          + Agregar Administrador
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {isCreating ? "Crear Nuevo Administrador" : "Editar Administrador"}
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
              <Label>Foto de Perfil</Label>
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage
                    src={adminToEdit?.profilePictureUrl || undefined}
                    alt="Profile picture"
                  />
                  <AvatarFallback>
                    {adminToEdit?.name?.[0] || "A"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div className="mb-4">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={adminToEdit?.name || ""}
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                defaultValue={adminToEdit?.email || ""}
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="phoneNumber">Teléfono</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                required
                defaultValue={adminToEdit?.phoneNumber || ""}
              />
            </div>

            {isCreating && (
              <>
                <div className="mb-4">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required={isCreating}
                    value={password}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required={isCreating}
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                  />
                  {passwordError && (
                    <p className="text-sm text-destructive mt-1">{passwordError}</p>
                  )}
                </div>
              </>
            )}

            <div className="mb-4 flex items-center justify-between">
              <Label htmlFor="accountStatus">Estado de Cuenta</Label>
              <Select
                name="accountStatus"
                defaultValue={adminToEdit?.accountStatus ?? "inactive"}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                  <SelectItem value="newAccount">Nueva Cuenta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <SheetFooter>
              <Button 
                type="submit"
                disabled={isCreating && (!!passwordError || !password || !confirmPassword)}
              >
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