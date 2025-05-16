import { useState, useEffect } from "react";
import {
  useLoaderData,
  json,
  useNavigation,
  useRouteError,
  useActionData,
} from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";

import { FidelityCard, LoyaltyLevel } from "~/models/types";
import {
  createDocument,
  createSubDocument,
  deleteDocument,
  fetchDocuments,
  updateDocument,
} from "~/services/firestore.server";
import { DataTable } from "~/components/ui/data-table";
import { fidelityCardColumns } from "~/components/custom/columns";
import { Skeleton } from "~/components/ui/skeleton";
import { FidelityCardForm } from "~/lib/features/wallet/fidelity-card-form";
import { uploadImage } from "~/services/firebase-storage.server";
import { Buffer } from "buffer";

export const loader: LoaderFunction = async () => {
  const fidelityCards: FidelityCard[] = await fetchDocuments<FidelityCard>(
    "cards"
  );

  // Para cada tarjeta, cargar sus niveles de lealtad
  for (const card of fidelityCards) {
    try {
      const levels = await fetchDocuments<LoyaltyLevel>(
        `cards/${card.id}/loyaltyLevels`
      );
      card.loyaltyLevels = levels;
    } catch (error) {
      console.error(`Error loading loyalty levels for card ${card.id}:`, error);
      card.loyaltyLevels = [];
    }
  }

  return { fidelityCards };
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

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("action");

  try {
    switch (action) {
      case "create":
      case "edit": {
        const id = formData.get("id") as string;
        const backgroundImageFile = formData.get("backgroundImage") as File;
        const logoFile = formData.get("logo") as File;

        let backgroundImageUrl = formData.get(
          "cardDesign.backgroundImage"
        ) as string;
        let logoUrl = formData.get("cardDesign.logo") as string;

        // if (backgroundImageFile && backgroundImageFile.size > 0) {
        //   const arrayBuffer = await backgroundImageFile.arrayBuffer();
        //   const buffer = Buffer.from(arrayBuffer);
        //   backgroundImageUrl = await uploadImage(
        //     buffer,
        //     backgroundImageFile.name,
        //     "cards"
        //   );
        // }

        if (logoFile && logoFile.size > 0) {
          const arrayBuffer = await logoFile.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          logoUrl = await uploadImage(buffer, logoFile.name, "cards");
        }

        // Extraer niveles de lealtad del formulario
        const loyaltyLevelsKeys = Array.from(formData.keys()).filter(key =>
          key.startsWith("loyaltyLevels[") && key.endsWith("].id")
        );

        interface TempLoyaltyLevel {
          id: string;
          level: number;
          name: string;
          requiredPoints: number;
        }

        const loyaltyLevels: LoyaltyLevel[] = loyaltyLevelsKeys
          .map(key => {
            const match = key.match(/\[(\d+)\]/);
            const index = match ? match[1] : null;
            console.log(match);
            if (!index) return null;

            return {
              id: formData.get(`loyaltyLevels[${index}].id`) as string,
              level: Number(formData.get(`loyaltyLevels[${index}].level`)),
              name: formData.get(`loyaltyLevels[${index}].name`) as string,
              requiredPoints: Number(formData.get(`loyaltyLevels[${index}].requiredPoints`)),
            };
          })
          .filter((level): level is TempLoyaltyLevel => level !== null)
          .map(level => ({
            ...level,
          }));

        const fidelityCard: FidelityCard = {
          cardTitle: formData.get("cardTitle") as string,
          cardDesign: {
            backgroundImage: backgroundImageUrl,
            logo: logoUrl,
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
            rewardPoints: formData.get("rules.rewardPoints") as string,
            status: formData.get("rules.status") as string,
          },
          id: id,
        };

        console.log(loyaltyLevels);

        if (action === "create") {
          const [errors, card] = await createDocument<FidelityCard>(
            "cards",
            fidelityCard
          );
          if (errors) {
            const values = Object.fromEntries(formData);
            return json({ errors, values });
          }

          // Si hay niveles de lealtad, los guardamos en Firestore
          if (loyaltyLevels && loyaltyLevels.length) {


            // Guardar los niveles en la subcolección
            for (const level of loyaltyLevels) {
              // Omitir el id para que Firestore genere uno nuevo
              const { id: levelId, ...levelData } = level as TempLoyaltyLevel;
              await createSubDocument<LoyaltyLevel>(
                "cards",
                "loyaltyLevels",
                levelData
              );
            }
          }

          return json({
            success: true,
            message: "Fidelity card created successfully!",
          });
        } else {
          await updateDocument<FidelityCard>(
            "cards",
            id,
            fidelityCard
          );

          // Actualizar los niveles de lealtad
          if (id) {
            // Primero, obtener los niveles actuales para comparar
            const currentLevels = await fetchDocuments<LoyaltyLevel>(
              `cards/${id}/loyaltyLevels`
            );

            // Eliminar niveles que ya no existen
            const newLevelIds = loyaltyLevels.map(level => (level as TempLoyaltyLevel).id);
            for (const currentLevel of currentLevels) {
              if (currentLevel.id && !newLevelIds.includes(currentLevel.id)) {
                await deleteDocument(`cards/${id}/loyaltyLevels`, currentLevel.id);
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
            message: "Fidelity card updated successfully!",
          });
        }
      }
      case "delete": {
        const id = formData.get("id") as string;

        // Eliminar también los niveles de lealtad
        const loyaltyLevels = await fetchDocuments<LoyaltyLevel>(
          `cards/${id}/loyaltyLevels`
        );

        for (const level of loyaltyLevels) {
          if (level.id) {
            await deleteDocument(`cards/${id}/loyaltyLevels`, level.id);
          }
        }

        await deleteDocument("cards", id);
        return json({
          success: true,
          message: "Fidelity card deleted successfully!",
        });
      }
    }
  } catch (error) {
    console.error("Error handling action:", error);
    return json({
      success: false,
      message: "An error occurred. Please try again.",
    });
  }
};

export function HydrateFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export default function Wallet() {
  const { fidelityCards } = useLoaderData<{ fidelityCards: FidelityCard[] }>();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
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
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Laboratorios, 🔬</h1>
      <FidelityCardForm
        isSheetOpen={isSheetOpen}
        setIsSheetOpen={setIsSheetOpen}
        fidelityCardToEdit={getFidelityCardToEdit()}
        isCreating={isCreating}
        setIsCreating={setIsCreating}
        editingId={editingId}
        setEditingId={setEditingId}
      />
      <DataTable
        columns={fidelityCardColumns({
          editAction: (id) => {
            setEditingId(id);
            setIsSheetOpen(true);
          },
          navigation,
        })}
        data={fidelityCards}
        filterColumn="cardTitle"
      />
    </div>
  );

  function getFidelityCardToEdit() {
    return fidelityCards.find((card) => card.id === editingId);
  }
}
