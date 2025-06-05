import { useState, useEffect } from "react";
import {
  useLoaderData,
  json,
  useNavigation,
  useRouteError,
  useActionData,
  redirect,
} from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { FidelityCard, LoyaltyLevel, Banner } from "~/models/types";
import {
  fetchDocument,
  updateDocument,
  deleteDocument,
  fetchDocuments,
  createDocument,
} from "~/services/firestore.server";
import { FidelityCardForm } from "~/lib/features/wallet/fidelity-card-form";
import { uploadImage } from "~/services/firebase-storage.server";
import { Buffer } from "buffer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { getCurrentUser } from "~/services/firebase-auth.server";
import { Card, CardContent } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { SingleImageUpload } from "~/components/custom/single-image-upload";
import { MultiImageUpload } from "~/components/custom/multi-image-upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Plus, X, Edit } from "lucide-react";

export const loader: LoaderFunction = async ({ params }) => {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/login");
  }

  const id = params.id;
  if (!id) {
    throw new Error("ID no proporcionado");
  }

  const fidelityCard = await fetchDocument<FidelityCard>("cards", id);
  if (!fidelityCard) {
    throw new Error("Tarjeta no encontrada");
  }

  try {
    const levels = await fetchDocuments<LoyaltyLevel>(
      `cards/${id}/loyaltyLevels`
    );
    fidelityCard.loyaltyLevels = levels;
  } catch (error) {
    console.error(`Error loading loyalty levels for card ${id}:`, error);
    fidelityCard.loyaltyLevels = [];
  }

  return { fidelityCard };
};

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="p-8 bg-card rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-destructive mb-4">
          Oops! Something went wrong
        </h1>
        <p className="text-xl text-muted-foreground mb-6">
          We're sorry, but an error occurred while processing your request.
        </p>
        <div
          className="bg-destructive/10 border-l-4 border-destructive text-destructive p-4 mb-6 rounded"
          role="alert"
        >
          <p className="font-bold">Error details:</p>
          <p>{(error as Error).message || "Unknown error"}</p>
        </div>
        <Button onClick={() => window.location.reload()} variant="default">
          Try Again
        </Button>
      </div>
    </div>
  );
}

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const action = formData.get("action");
  const id = params.id;

  if (!id) {
    return json({
      success: false,
      message: "ID no proporcionado",
    });
  }

  try {
    switch (action) {
      case "edit": {
        //Obtiene archivos o si no existe, null
        const logoFile = formData.get("logo") as File;
        const backgroundImageFile = formData.get("backgroundImage") as File;
        const bannerFiles = formData.getAll("bannerImage") as File[];
        const productsImageFile = formData.get("productsImage") as File;
        //Obtiene urls de las imagnes actuales en inputs ocultos
        let currentLogoUrl = formData.get("currentLogoUrl") as string;
        let currentBackgroundImageUrl = formData.get("currentBackgroundImageUrl") as string;
        let currentProductsImageUrl = formData.get("currentProductsImageUrl") as string;

        let logoUrl = currentLogoUrl || "";
        let backgroundImageUrl = currentBackgroundImageUrl || "";
        let productsImageUrl = currentProductsImageUrl || "";

        // Procesar imagen de fondo
        if (backgroundImageFile && backgroundImageFile.size > 0) {
          const arrayBuffer = await backgroundImageFile.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          backgroundImageUrl = await uploadImage(
            buffer,
            backgroundImageFile.name,
            "cards"
          );
        }

        // Procesar logo
        if (logoFile && logoFile.size > 0) {
          const arrayBuffer = await logoFile.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          logoUrl = await uploadImage(buffer, logoFile.name, "cards");
        }

        // Procesar imagen de productos
        if (productsImageFile && productsImageFile.size > 0) {
          const arrayBuffer = await productsImageFile.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          productsImageUrl = await uploadImage(buffer, productsImageFile.name, "cards");
        }

        // Procesar banners
        const bannerImages: Banner[] = [];
        // Procesar banners existentes
        const existingBanners = Array.from(formData.keys())
          .filter((key) => key.startsWith("banners[") && key.endsWith("].id"))
          .map((key) => {
            const index = key.match(/\[(\d+)\]/)?.[1];
            if (!index) return null;
            return {
              id: formData.get(`banners[${index}].id`) as string,
              img: formData.get(`banners[${index}].img`) as string,
            };
          })
          .filter((banner): banner is Banner => banner !== null);

        bannerImages.push(...existingBanners);

        // Procesar nuevos banners
        for (const file of bannerFiles) {
          if (file && file.size > 0) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const imgUrl = await uploadImage(buffer, file.name, "cards");
            bannerImages.push({
              id: `banner-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}`,
              img: imgUrl,
            });
          }
        }

        // Extraer niveles de lealtad del formulario
        const loyaltyLevelsKeys = Array.from(formData.keys()).filter(
          (key) => key.startsWith("loyaltyLevels[") && key.endsWith("].id")
        );

        interface TempLoyaltyLevel {
          id: string;
          level: number;
          name: string;
          requiredPoints: number;
        }

        const loyaltyLevels: LoyaltyLevel[] = loyaltyLevelsKeys
          .map((key) => {
            const match = key.match(/\[(\d+)\]/);
            const index = match ? match[1] : null;
            if (!index) return null;

            return {
              id: formData.get(`loyaltyLevels[${index}].id`) as string,
              level: Number(formData.get(`loyaltyLevels[${index}].level`)),
              name: formData.get(`loyaltyLevels[${index}].name`) as string,
              requiredPoints: Number(
                formData.get(`loyaltyLevels[${index}].requiredPoints`)
              ),
            };
          })
          .filter((level): level is TempLoyaltyLevel => level !== null)
          .map((level) => ({
            ...level,
          }));

        const fidelityCard: Partial<FidelityCard> = {
          cardTitle: formData.get("cardTitle") as string,
          cardDesign: {
            backgroundImage: backgroundImageUrl,
            logo: logoUrl,
            productsImage: productsImageUrl,
            color: formData.get("cardDesign.color") as string,
            bannerImages: bannerImages,
          },
          contact: {
            locationUrl: formData.get("contact.locationUrl") as string,
            phoneNumber: formData.get("contact.phoneNumber") as string,
            website: formData.get("contact.website") as string,
          },
          description: formData.get("description") as string,
          laboratoryId: formData.get("laboratoryId") as string,
          rules: {
            currency: formData.get("rules.currency") as string,
            forPurchasePrice: Number(formData.get("rules.forPurchasePrice")),
            initialCredits: Number(formData.get("rules.initialCredits")),
            status: formData.get("rules.status") as string,
          },
        };

        try {
          await updateDocument<FidelityCard>("cards", id, fidelityCard);

          // Actualizar los niveles de lealtad
          if (id) {
            // Primero, obtener los niveles actuales para comparar
            const currentLevels = await fetchDocuments<LoyaltyLevel>(
              `cards/${id}/loyaltyLevels`
            );

            // Eliminar niveles que ya no existen
            const newLevelIds = loyaltyLevels.map(
              (level) => (level as TempLoyaltyLevel).id
            );
            for (const currentLevel of currentLevels) {
              if (currentLevel.id && !newLevelIds.includes(currentLevel.id)) {
                await deleteDocument(
                  `cards/${id}/loyaltyLevels`,
                  currentLevel.id
                );
              }
            }

            // Actualizar o crear nuevos niveles
            for (const level of loyaltyLevels) {
              const typedLevel = level as TempLoyaltyLevel;
              const levelId = typedLevel.id;
              if (levelId && levelId.startsWith("temp-")) {
                // Es un nuevo nivel, crear documento
                const { id: tempId, ...levelData } = typedLevel;
                await createDocument(`cards/${id}/loyaltyLevels`, levelData);
              } else if (levelId) {
                // Es un nivel existente, actualizarlo
                const { id: tempId, ...levelData } = typedLevel;
                await updateDocument(
                  `cards/${id}/loyaltyLevels`,
                  levelId,
                  levelData
                );
              }
            }
          }

          return json({
            success: true,
            message: "Tarjeta actualizada exitosamente!",
          });
        } catch (error) {
          return json({
            success: false,
            message: "Error al actualizar la tarjeta. Por favor, intente nuevamente.",
          });
        }
      }
      case "delete": {
        // Buscar y eliminar todas las referencias en userCards
        const userCards = await fetchDocuments<{ id: string }>("userCards", [
          "fidelityCardId",
          "==",
          id,
        ]);

        // Eliminar cada userCard encontrado
        for (const userCard of userCards) {
          if (userCard.id) {
            await deleteDocument("userCards", userCard.id);
          }
        }

        // Eliminar también los niveles de lealtad
        const loyaltyLevels = await fetchDocuments<LoyaltyLevel>(
          `cards/${id}/loyaltyLevels`
        );

        for (const level of loyaltyLevels) {
          if (level.id) {
            await deleteDocument(`cards/${id}/loyaltyLevels`, level.id);
          }
        }

        // Finalmente, eliminar la tarjeta
        await deleteDocument("cards", id);
        return redirect("/wallet");
      }
    }
  } catch (error) {
    console.error("Error handling action:", error);
    return json({
      success: false,
      message: "Ocurrió un error. Por favor, intente nuevamente.",
    });
  }
};

export default function WalletDetail() {
  const { fidelityCard } = useLoaderData<{ fidelityCard: FidelityCard }>();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const navigation = useNavigation();
  const actionData = useActionData<{ success: boolean; message: string }>();

  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        toast.success(actionData.message, {
          duration: 3000,
          className: "bg-background border-green-500",
          position: "bottom-right",
          icon: "✅",
          style: {
            color: "hsl(var(--foreground))",
          },
        });
        setIsDeleteDialogOpen(false);
      } else {
        toast.error(actionData.message, {
          duration: 3000,
          className: "bg-background border-destructive",
          position: "bottom-right",
          icon: "❌",
          style: {
            color: "hsl(var(--foreground))",
          },
        });
      }
    }
  }, [actionData]);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{fidelityCard.cardTitle}</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Cancelar" : "Editar"}
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            Eliminar
          </Button>
        </div>
      </div>

      {isEditing ? (
        <FidelityCardForm
          isSheetOpen={true}
          setIsSheetOpen={() => {}}
          fidelityCardToEdit={fidelityCard}
          isCreating={false}
          setIsCreating={() => {}}
          editingId={fidelityCard.id}
          setEditingId={() => {}}
        />
      ) : (
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="design">Diseño</TabsTrigger>
            <TabsTrigger value="levels">Niveles</TabsTrigger>
            <TabsTrigger value="banners">Banners</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label>Título</Label>
                    <p className="text-lg">{fidelityCard.cardTitle}</p>
                  </div>
                  <div>
                    <Label>Descripción</Label>
                    <p className="text-lg">{fidelityCard.description}</p>
                  </div>
                  <div>
                    <Label>Teléfono</Label>
                    <p className="text-lg">{fidelityCard.contact.phoneNumber}</p>
                  </div>
                  <div>
                    <Label>Sitio Web</Label>
                    <p className="text-lg">{fidelityCard.contact.website}</p>
                  </div>
                  <div>
                    <Label>Créditos Iniciales</Label>
                    <p className="text-lg">{fidelityCard.rules.initialCredits}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="design" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label>Logo</Label>
                    {fidelityCard.cardDesign.logo ? (
                      <img
                        src={fidelityCard.cardDesign.logo}
                        alt="Logo"
                        className="w-32 h-32 object-contain"
                      />
                    ) : (
                      <p>No hay logo</p>
                    )}
                  </div>
                  <div>
                    <Label>Imagen de Fondo</Label>
                    {fidelityCard.cardDesign.backgroundImage ? (
                      <img
                        src={fidelityCard.cardDesign.backgroundImage}
                        alt="Background"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <p>No hay imagen de fondo</p>
                    )}
                  </div>
                  <div>
                    <Label>Imagen de Productos</Label>
                    {fidelityCard.cardDesign.productsImage ? (
                      <img
                        src={fidelityCard.cardDesign.productsImage}
                        alt="Products"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <p>No hay imagen de productos</p>
                    )}
                  </div>
                  <div>
                    <Label>Color</Label>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full border"
                        style={{ backgroundColor: fidelityCard.cardDesign.color }}
                      />
                      <p>{fidelityCard.cardDesign.color}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="levels" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {fidelityCard.loyaltyLevels?.length === 0 ? (
                    <p>No hay niveles definidos</p>
                  ) : (
                    <div className="grid gap-4">
                      {fidelityCard.loyaltyLevels
                        ?.sort((a, b) => a.level - b.level)
                        .map((level) => (
                          <Card key={level.id}>
                            <CardContent className="p-4">
                              <h4 className="font-medium">
                                Nivel {level.level}: {level.name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Puntos requeridos: {level.requiredPoints}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="banners" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {fidelityCard.cardDesign.bannerImages?.length === 0 ? (
                    <p>No hay banners definidos</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {fidelityCard.cardDesign.bannerImages?.map((banner) => (
                        <Card key={banner.id}>
                          <CardContent className="p-4">
                            <img
                              src={banner.img}
                              alt="Banner"
                              className="w-full h-40 object-cover rounded-md"
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Tarjeta de Fidelidad</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            ¿Está seguro que desea eliminar la tarjeta "{fidelityCard.cardTitle}"? Esta acción eliminará:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>La tarjeta de fidelidad y todos sus niveles de lealtad</li>
            <li>
              Todas las referencias a esta tarjeta en las cuentas de usuarios
            </li>
            <li>Los puntos acumulados por los usuarios en esta tarjeta</li>
          </ul>
          <p className="text-sm font-medium text-destructive mt-2">
            Esta acción no se puede deshacer.
          </p>
          <DialogFooter>
            <form method="post" className="flex gap-2">
              <input type="hidden" name="action" value="delete" />
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={navigation.state === "submitting"}
              >
                {navigation.state === "submitting"
                  ? "Eliminando..."
                  : "Eliminar"}
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 