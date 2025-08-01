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
import { FidelityCard, LoyaltyLevel, Banner } from "~/models/types";
import { toast } from "~/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { SingleImageUpload } from "~/components/custom/single-image-upload";
import { MultiImageUpload } from "~/components/custom/multi-image-upload";
import { Card, CardContent } from "~/components/ui/card";
import { X, Plus, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import React from "react";

interface FidelityCardFormProps {
  fidelityCardToEdit: FidelityCard | undefined;
  isCreating: boolean;
  setIsCreating: (value: boolean) => void;
  editingId: string | null;
  setEditingId: (value: string | null) => void;
  isSheetOpen: boolean;
  setIsSheetOpen: (value: boolean) => void;
}

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

const validateImageFile = (file: File) => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(
      "Tipo de archivo no permitido. Solo se permiten imágenes (image/jpeg, image/png, image/gif, image/webp, image/svg+xml)"
    );
  }
};

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
  const [productsImage, setProductsImage] = useState<File | null>(null);
  const [bannerImages, setBannerImages] = useState<File[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loyaltyLevels, setLoyaltyLevels] = useState<LoyaltyLevel[]>([]);
  const [isLevelDialogOpen, setIsLevelDialogOpen] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<LoyaltyLevel | null>(null);
  const [isEditingLevel, setIsEditingLevel] = useState(false);

  useEffect(() => {
    // Initialize loyalty levels and banners from the existing card data
    if (fidelityCardToEdit) {
      if (fidelityCardToEdit.loyaltyLevels) {
        setLoyaltyLevels(fidelityCardToEdit.loyaltyLevels);
      }
      if (fidelityCardToEdit.cardDesign.bannerImages) {
        setBanners(fidelityCardToEdit.cardDesign.bannerImages);
      }
    } else {
      setLoyaltyLevels([]);
      setBanners([]);
    }
  }, [fidelityCardToEdit]);

  const handleSheetOpenChange = (open: boolean) => {
    if (!open) {
      // Clear the images when the sheet is dismissed
      setBackgroundImage(null);
      setLogoImage(null);
      setBannerImages([]);
      setBanners([]);
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
      id:
        isEditingLevel && currentLevel?.id
          ? currentLevel.id
          : `temp-${Date.now()}`,
      level: parseInt(formData.get("level") as string) || 0,
      name: formData.get("name") as string,
      requiredPoints: parseInt(formData.get("requiredPoints") as string) || 0,
    };

    if (isEditingLevel) {
      setLoyaltyLevels((prev) =>
        prev.map((level) => (level.id === newLevel.id ? newLevel : level))
      );
    } else {
      setLoyaltyLevels((prev) => [...prev, newLevel]);
    }

    closeLevelDialog();
  };

  const removeLevel = (id: string) => {
    setLoyaltyLevels((prev) => prev.filter((level) => level.id !== id));
  };

  const handleBannerUpload = (file: File) => {
    try {
      validateImageFile(file);
      setBannerImages((prev) => [...prev, file]);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error al subir la imagen",
        variant: "destructive",
      });
    }
  };

  const removeBanner = (index: number) => {
    setBannerImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingBanner = (id: string) => {
    setBanners((prev) => prev.filter((banner) => banner.id !== id));
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
              {isCreating ? "Crear Nueva Tarjeta" : "Editar Tarjeta"}
            </SheetTitle>
          </SheetHeader>
          <Form
            method="post"
            className="space-y-4"
            encType="multipart/form-data"
          >
            <fieldset disabled={navigation.state === "submitting"}>
              <input
                type="hidden"
                name="action"
                value={isCreating ? "create" : "edit"}
              />
              {!isCreating && (
                <input type="hidden" name="id" value={editingId || ""} />
              )}
              {!isCreating && fidelityCardToEdit?.cardDesign.backgroundImage && (
              <input
                type="hidden"
                name="currentBackgroundImageUrl"
                value={fidelityCardToEdit?.cardDesign.backgroundImage}
              />
            )}
            {!isCreating && fidelityCardToEdit?.cardDesign.logo && (
              <input
                type="hidden"
                name="currentLogoUrl"
                value={fidelityCardToEdit?.cardDesign.logo}
              />
            )}
            {!isCreating && fidelityCardToEdit?.cardDesign.productsImage && (
              <input
                type="hidden"
                name="currentProductsImageUrl"
                value={fidelityCardToEdit?.cardDesign.productsImage}
              />
            )}

              {/* Add hidden inputs for loyalty levels */}
              {loyaltyLevels.map((level, index) => (
                <div key={level.id}>
                  <input
                    type="hidden"
                    name={`loyaltyLevels[${index}].id`}
                    value={level.id || ""}
                  />
                  <input
                    type="hidden"
                    name={`loyaltyLevels[${index}].level`}
                    value={level.level}
                  />
                  <input
                    type="hidden"
                    name={`loyaltyLevels[${index}].name`}
                    value={level.name}
                  />
                  <input
                    type="hidden"
                    name={`loyaltyLevels[${index}].requiredPoints`}
                    value={level.requiredPoints}
                  />
                </div>
              ))}

              {/* Add hidden inputs for banners */}
              {banners.map((banner, index) => (
                <div key={banner.id}>
                  <input
                    type="hidden"
                    name={`banners[${index}].id`}
                    value={banner.id}
                  />
                  <input
                    type="hidden"
                    name={`banners[${index}].img`}
                    value={banner.img}
                  />
                </div>
              ))}

              <div className="space-y-8">
                {/* Sección General */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Información General</h3>
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
                    <Label htmlFor="logo">Logo</Label>
                    <SingleImageUpload
                      id="logo"
                      name="logo"
                      onImageUpload={(file) => setLogoImage(file)}
                      initialImageUrl={fidelityCardToEdit?.cardDesign.logo}
                      helpText="Sube el logo de la tarjeta (máx 3MB)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="backgroundImage">Imagen de Tarjeta</Label>
                    <SingleImageUpload
                      id="backgroundImage"
                      name="backgroundImage"
                      onImageUpload={(file) => setBackgroundImage(file)}
                      initialImageUrl={fidelityCardToEdit?.cardDesign.backgroundImage}
                      helpText="Sube la imagen de fondo de la tarjeta (máx 3MB)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="productsImage">Imagen de Productos</Label>
                    <SingleImageUpload
                      id="productsImage"
                      name="productsImage"
                      onImageUpload={(file) => setProductsImage(file)}
                      initialImageUrl={fidelityCardToEdit?.cardDesign.productsImage}
                      helpText="Sube la imagen de productos de la tarjeta (máx 3MB)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="color">Color de la Tarjeta</Label>
                    <Input
                      id="color"
                      name="cardDesign.color"
                      type="color"
                      defaultValue={
                        fidelityCardToEdit?.cardDesign.color || "#ffffff"
                      }
                      className="w-full h-10"
                    />
                  </div>
                </div>

                {/* Sección de Contacto */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Información de Contacto
                  </h3>
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

                {/* Sección de Reglas */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Reglas del Programa</h3>
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
                </div>

                {/* Sección de Niveles */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">
                      Niveles de Lealtad
                    </h3>
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
                      <p className="text-muted-foreground">
                        No hay niveles definidos
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {loyaltyLevels
                        .sort((a, b) => a.level - b.level)
                        .map((level) => (
                          <Card key={level.id} className="p-0">
                            <CardContent className="p-4 flex justify-between items-center">
                              <div>
                                <h4 className="font-medium">
                                  Nivel {level.level}: {level.name}
                                </h4>
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
                                  onClick={() =>
                                    removeLevel(level.id as string)
                                  }
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

                {/* Sección de Banners */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Banners</h3>
                  </div>

                  <MultiImageUpload
                    id="bannerImage"
                    name="bannerImage"
                    imageFiles={bannerImages}
                    onImagesChange={setBannerImages}
                    helpText="Sube los banners de la tarjeta (máx 3MB cada uno)"
                    maxImages={5}
                  />

                  {/* Mostrar banners existentes */}
                  {banners.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      {banners.map((banner) => (
                        <Card key={banner.id} className="relative">
                          <CardContent className="p-4">
                            <img
                              src={banner.img}
                              alt="Banner Preview"
                              className="w-full h-40 object-cover rounded-md"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2"
                              onClick={() => removeExistingBanner(banner.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {banners.length === 0 && bannerImages.length === 0 && (
                    <div className="text-center p-4 border border-dashed rounded-md">
                      <p className="text-muted-foreground">
                        No hay banners definidos
                      </p>
                    </div>
                  )}
                </div>
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
              <Button
                type="button"
                variant="outline"
                onClick={closeLevelDialog}
              >
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
