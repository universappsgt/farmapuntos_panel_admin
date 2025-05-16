import { useState, useEffect } from "react";
import { Form, useNavigation, useActionData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { FidelityCard, LoyaltyLevel } from "~/models/types";
import { toast } from "~/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ImageUpload } from "~/components/custom/image-upload";
import { Card, CardContent } from "~/components/ui/card";
import { X, Plus, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";

interface FidelityCardFormProps {
  fidelityCardToEdit: FidelityCard | undefined;
  isCreating: boolean;
  setIsCreating: (value: boolean) => void;
  editingId: string | null;
  setEditingId: (value: string | null) => void;
  isSheetOpen: boolean;
  setIsSheetOpen: (value: boolean) => void;
}

export function FidelityCardForm({
  fidelityCardToEdit,
  isCreating,
  setIsCreating,
  editingId,
  setEditingId,
  isSheetOpen,
  setIsSheetOpen,
}: FidelityCardFormProps) {
  const navigation = useNavigation();
  const actionData = useActionData<{ success: boolean; message: string }>();
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [logoImage, setLogoImage] = useState<File | null>(null);
  const [loyaltyLevels, setLoyaltyLevels] = useState<LoyaltyLevel[]>([]);
  const [isLevelDialogOpen, setIsLevelDialogOpen] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<LoyaltyLevel | null>(null);
  const [isEditingLevel, setIsEditingLevel] = useState(false);

  useEffect(() => {
    if (actionData && actionData.success) {
      setIsSheetOpen(false);
      toast({
        title: actionData.message,
        variant: actionData.success ? "default" : "destructive",
      });
    }
  }, [actionData, setIsSheetOpen]);

  useEffect(() => {
    // Initialize loyalty levels from the existing card data
    if (fidelityCardToEdit && fidelityCardToEdit.loyaltyLevels) {
      setLoyaltyLevels(fidelityCardToEdit.loyaltyLevels);
    } else {
      setLoyaltyLevels([]);
    }
  }, [fidelityCardToEdit]);

  const handleSheetOpenChange = (open: boolean) => {
    if (!open) {
      // Clear the images when the sheet is dismissed
      setBackgroundImage(null);
      setLogoImage(null);
      setLoyaltyLevels([]);
    }
    setIsSheetOpen(open);
  };

  const openLevelDialog = (level: LoyaltyLevel | null = null) => {
    setCurrentLevel(level);
    setIsEditingLevel(!!level);
    setIsLevelDialogOpen(true);
  };

  const closeLevelDialog = () => {
    setCurrentLevel(null);
    setIsEditingLevel(false);
    setIsLevelDialogOpen(false);
  };

  const addOrUpdateLevel = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newLevel: LoyaltyLevel = {
      id: isEditingLevel && currentLevel?.id ? currentLevel.id : `temp-${Date.now()}`,
      level: parseInt(formData.get("level") as string) || 0,
      name: formData.get("name") as string,
      requiredPoints: parseInt(formData.get("requiredPoints") as string) || 0,
    };

    if (isEditingLevel) {
      setLoyaltyLevels(prev => 
        prev.map(level => level.id === newLevel.id ? newLevel : level)
      );
    } else {
      setLoyaltyLevels(prev => [...prev, newLevel]);
    }

    closeLevelDialog();
  };

  const removeLevel = (id: string) => {
    setLoyaltyLevels(prev => prev.filter(level => level.id !== id));
  };

  return (
    <>
      <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetTrigger asChild>
          <Button
            className="mb-4"
            onClick={() => {
              setIsCreating(true);
              setEditingId(null);
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
              {isCreating ? "Create New Fidelity Card" : "Edit Fidelity Card"}
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
              
              {/* Add hidden inputs for loyalty levels */}
              {loyaltyLevels.map((level, index) => (
                <div key={level.id}>
                  <input type="hidden" name={`loyaltyLevels[${index}].id`} value={level.id || ""} />
                  <input type="hidden" name={`loyaltyLevels[${index}].level`} value={level.level} />
                  <input type="hidden" name={`loyaltyLevels[${index}].name`} value={level.name} />
                  <input type="hidden" name={`loyaltyLevels[${index}].requiredPoints`} value={level.requiredPoints} />
                </div>
              ))}

              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="contact">Contacto</TabsTrigger>
                  <TabsTrigger value="rules">Reglas</TabsTrigger>
                  <TabsTrigger value="levels">Niveles</TabsTrigger>
                </TabsList>
                <TabsContent value="general">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardTitle">Título de la Tarjeta</Label>
                      <Input
                        id="cardTitle"
                        name="cardTitle"
                        required
                        defaultValue={fidelityCardToEdit?.cardTitle || ""}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        name="description"
                        required
                        defaultValue={fidelityCardToEdit?.description || ""}
                      />
                    </div>
                    <div>
                      <Label htmlFor="backgroundImage">Imagen de Fondo</Label>
                      <Card className="mt-2">
                        <CardContent className="p-4">
                          {backgroundImage ||
                          fidelityCardToEdit?.cardDesign.backgroundImage ? (
                            <img
                              src={
                                backgroundImage
                                  ? URL.createObjectURL(backgroundImage)
                                  : fidelityCardToEdit?.cardDesign.backgroundImage
                              }
                              alt="Background Preview"
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
                        id="backgroundImage"
                        name="backgroundImage"
                        onImageUpload={(file) => setBackgroundImage(file)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="logo">Logo</Label>
                      <Card className="mt-2">
                        <CardContent className="p-4">
                          {logoImage || fidelityCardToEdit?.cardDesign.logo ? (
                            <img
                              src={
                                logoImage
                                  ? URL.createObjectURL(logoImage)
                                  : fidelityCardToEdit?.cardDesign.logo
                              }
                              alt="Logo Preview"
                              className="w-32 h-32 object-contain"
                            />
                          ) : (
                            <div className="w-32 h-32 bg-muted flex items-center justify-center rounded-md">
                              Sin logo
                            </div>
                          )}
                        </CardContent>
                      </Card>
                      <ImageUpload
                        id="logo"
                        name="logo"
                        onImageUpload={(file) => setLogoImage(file)}
                      />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="contact">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="locationUrl">URL de Ubicación</Label>
                      <Input
                        id="locationUrl"
                        name="contact.locationUrl"
                        defaultValue={
                          fidelityCardToEdit?.contact.locationUrl || ""
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="phoneNumber">Teléfono</Label>
                      <Input
                        id="phoneNumber"
                        name="contact.phoneNumber"
                        defaultValue={
                          fidelityCardToEdit?.contact.phoneNumber || ""
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Sitio Web</Label>
                      <Input
                        id="website"
                        name="contact.website"
                        defaultValue={fidelityCardToEdit?.contact.website || ""}
                      />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="rules">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currency">Moneda</Label>
                      <Input
                        id="currency"
                        name="rules.currency"
                        defaultValue={fidelityCardToEdit?.rules.currency || ""}
                      />
                    </div>
                    <div>
                      <Label htmlFor="forPurchasePrice">Precio de Compra</Label>
                      <Input
                        id="forPurchasePrice"
                        name="rules.forPurchasePrice"
                        type="number"
                        defaultValue={
                          fidelityCardToEdit?.rules.forPurchasePrice || 0
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="initialCredits">Créditos Iniciales</Label>
                      <Input
                        id="initialCredits"
                        name="rules.initialCredits"
                        type="number"
                        defaultValue={
                          fidelityCardToEdit?.rules.initialCredits || 0
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="rewardPoints">Puntos de Recompensa</Label>
                      <Input
                        id="rewardPoints"
                        name="rules.rewardPoints"
                        defaultValue={
                          fidelityCardToEdit?.rules.rewardPoints || ""
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Estado</Label>
                      <Select
                        name="rules.status"
                        defaultValue={fidelityCardToEdit?.rules.status || ""}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Activo</SelectItem>
                          <SelectItem value="inactive">Inactivo</SelectItem>
                          <SelectItem value="pending">Pendiente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="levels">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-medium">Niveles de Lealtad</h3>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => openLevelDialog()}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Agregar Nivel
                      </Button>
                    </div>
                    
                    {loyaltyLevels.length === 0 ? (
                      <div className="text-center p-4 border border-dashed rounded-md">
                        <p className="text-muted-foreground">No hay niveles definidos</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {loyaltyLevels
                          .sort((a, b) => a.level - b.level)
                          .map((level) => (
                            <Card key={level.id} className="p-0">
                              <CardContent className="p-4 flex justify-between items-center">
                                <div>
                                  <h4 className="font-medium">Nivel {level.level}: {level.name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Puntos requeridos: {level.requiredPoints}
                                  </p>
                                </div>
                                <div className="flex space-x-2">
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => openLevelDialog(level)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => removeLevel(level.id as string)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
              <SheetFooter>
                <Button type="submit">
                  {navigation.state === "submitting"
                    ? "Saving..."
                    : isCreating
                    ? "Create"
                    : "Save"}
                </Button>
              </SheetFooter>
            </fieldset>
          </Form>
        </SheetContent>
      </Sheet>

      <Dialog open={isLevelDialogOpen} onOpenChange={setIsLevelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditingLevel ? "Editar Nivel" : "Agregar Nivel"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={addOrUpdateLevel} className="space-y-4">
            <div>
              <Label htmlFor="level">Número de Nivel</Label>
              <Input
                id="level"
                name="level"
                type="number"
                min="1"
                required
                defaultValue={currentLevel?.level || ""}
              />
            </div>
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={currentLevel?.name || ""}
              />
            </div>
            <div>
              <Label htmlFor="requiredPoints">Puntos Requeridos</Label>
              <Input
                id="requiredPoints"
                name="requiredPoints"
                type="number"
                min="0"
                required
                defaultValue={currentLevel?.requiredPoints || ""}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeLevelDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {isEditingLevel ? "Actualizar" : "Agregar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
