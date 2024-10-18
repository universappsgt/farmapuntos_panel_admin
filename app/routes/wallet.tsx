import { useEffect, useState } from "react";
import {
  useLoaderData,
  Form,
  useActionData,
  json,
  useNavigation,
} from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
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

export const loader: LoaderFunction = async () => {
  const fidelityCards: FidelityCard[] = await fetchDocuments<FidelityCard>(
    "fidelityCards"
  );

  return { fidelityCards };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("action");

  try {
    switch (action) {
      case "create": {
        const id = formData.get("id");

        const fidelityCard: FidelityCard = {
          cardDesign: {
            backgroundImage: formData.get("backgroundImage") as string,
            logo: formData.get("logo") as string,
            cardTitle: formData.get("cardTitle") as string,
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
          cardDesign: {
            backgroundImage: formData.get("backgroundImage") as string,
            logo: formData.get("logo") as string,
            cardTitle: formData.get("cardTitle") as string,
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

export default function Wallet() {
  const { fidelityCards } = useLoaderData<{ fidelityCards: FidelityCard[] }>();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const navigation = useNavigation();

  const data = useActionData<typeof action>();

  useEffect(() => {
    if (data && data.success) {
      setIsSheetOpen(false);
      toast({
        title: data.message,
        variant: data.success ? "default" : "destructive",
      });
    }
  }, [data]);

  const isLoading = navigation.state === "loading";

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Wallet</h1>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button
            className="mb-4"
            onClick={() => {
              setIsCreating(true);
              setEditingId(null);
            }}
          >
            + Add Fidelity Card
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {isCreating ? "Create New Fidelity Card" : "Edit Fidelity Card"}
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
              {/* Add form fields for FidelityCard properties */}
              {/* Example: */}
              <div className="mb-4">
                <Label htmlFor="cardTitle">Card Title</Label>
                <Input
                  id="cardTitle"
                  name="cardTitle"
                  required
                  defaultValue={
                    !isCreating
                      ? fidelityCards.find(
                          (card) => card.laboratoryId === editingId
                        )?.cardDesign.cardTitle
                      : ""
                  }
                />
              </div>
              {/* Add more form fields for other FidelityCard properties */}
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

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <DataTable
          columns={fidelityCardColumns({
            editAction: (id) => {
              console.log("Editing ID:", id);
              setEditingId(id);
              setIsSheetOpen(true);
            },
            navigation,
          })}
          data={fidelityCards}
        />
      )}
    </div>
  );
}
