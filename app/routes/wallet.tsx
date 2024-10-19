import { useState } from "react";
import {
  useLoaderData,
  json,
  useNavigation,
  useRouteError,
} from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { Button } from "~/components/ui/button";

import { FidelityCard } from "~/models/types";
import {
  createDocument,
  deleteDocument,
  fetchDocuments,
  updateDocument,
} from "~/services/firestore.server";
import { toast } from "~/hooks/use-toast";
import { Trash } from "lucide-react";
import { DataTable } from "~/components/ui/data-table";
import { fidelityCardColumns } from "~/components/custom/columns";
import { Skeleton } from "~/components/ui/skeleton";
import { FidelityCardForm } from "~/lib/features/wallet/fidelity-card-form";

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
      case "create": {
        const id = formData.get("id");

        const fidelityCard: FidelityCard = {
          cardTitle: formData.get("cardTitle") as string,
          cardDesign: {
            backgroundImage: formData.get("backgroundImage") as string,
            logo: formData.get("logo") as string,
          },
          contact: {
            locationUrl: formData.get("locationUrl") as string,
            phoneNumber: formData.get("phoneNumber") as string,
            website: formData.get("website") as string,
          },
          description: formData.get("description") as string,
          laboratoryId: formData.get("laboratoryId") as string,
          rules: {
            currency: formData.get("currency") as string,
            forPurchasePrice: Number(formData.get("forPurchasePrice")),
            initialCredits: Number(formData.get("initialCredits")),
            rewardPoints: formData.get("rewardPoints") as string,
            status: formData.get("status") as string,
          },
          id: id as string,
        };

        const [errors, card] = await createDocument<FidelityCard>(
          "fidelityCards",
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
      }
      case "edit": {
        const id = formData.get("id");
        const fidelityCard: FidelityCard = {
          cardTitle: formData.get("cardTitle") as string,
          cardDesign: {
            backgroundImage: formData.get("backgroundImage") as string,
            logo: formData.get("logo") as string,
          },
          contact: {
            locationUrl: formData.get("locationUrl") as string,
            phoneNumber: formData.get("phoneNumber") as string,
            website: formData.get("website") as string,
          },
          description: formData.get("description") as string,
          laboratoryId: formData.get("laboratoryId") as string,
          rules: {
            currency: formData.get("currency") as string,
            forPurchasePrice: Number(formData.get("forPurchasePrice")),
            initialCredits: Number(formData.get("initialCredits")),
            rewardPoints: formData.get("rewardPoints") as string,
            status: formData.get("status") as string,
          },
          id: "",
        };

        await updateDocument<FidelityCard>(
          "fidelityCards",
          id as string,
          fidelityCard
        );
        return json({
          success: true,
          message: "Fidelity card updated successfully!",
        });
      }
      case "delete": {
        const id = formData.get("id");
        await deleteDocument("fidelityCards", id as string);
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
      />
    </div>
  );

  function getFidelityCardToEdit() {
    return fidelityCards.find((card) => card.id === editingId);
  }
}
