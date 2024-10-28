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

import { FidelityCard } from "~/models/types";
import {
  createDocument,
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

  console.log(fidelityCards);
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
        const id = formData.get("id");
        const backgroundImageFile = formData.get("backgroundImage") as File;
        const logoFile = formData.get("logo") as File;

        let backgroundImageUrl = formData.get(
          "cardDesign.backgroundImage"
        ) as string;
        let logoUrl = formData.get("cardDesign.logo") as string;

        if (backgroundImageFile.size > 0) {
          const arrayBuffer = await backgroundImageFile.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          backgroundImageUrl = await uploadImage(
            buffer,
            backgroundImageFile.name,
            "cards"
          );
        }

        if (logoFile.size > 0) {
          const arrayBuffer = await logoFile.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          logoUrl = await uploadImage(buffer, logoFile.name, "cards");
        }

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
          id: id as string,
        };

        if (action === "create") {
          const [errors, card] = await createDocument<FidelityCard>(
            "cards",
            fidelityCard
          );
          if (errors) {
            const values = Object.fromEntries(formData);
            return json({ errors, values });
          }
          return json({
            success: true,
            message: "Fidelity card created successfully!",
          });
        } else {
          await updateDocument<FidelityCard>(
            "cards",
            id as string,
            fidelityCard
          );
          return json({
            success: true,
            message: "Fidelity card updated successfully!",
          });
        }
      }
      case "delete": {
        const id = formData.get("id");
        await deleteDocument("cards", id as string);
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
      <h1 className="text-3xl font-bold mb-6">Wallet</h1>
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
