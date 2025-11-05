import { useEffect, useState } from "react";
import {
  useLoaderData,
  Form,
  useActionData,
  json,
  useNavigation,
  redirect,
} from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { Pharmacy } from "~/models/types";
import {
  createDocument,
  deleteDocument,
  fetchDocuments,
  updateDocument,
} from "~/services/firestore.server";
import { DataTable } from "~/components/ui/data-table";
import { pharmacyColumns } from "~/components/custom/columns";
import { PharmacyForm } from "~/lib/features/pharmacies/pharmacy-form";
import { toast } from "sonner";
import { getCurrentUser } from "~/services/firebase-auth.server";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getCurrentUser(request);
  if (!user) {
    return redirect("/login");
  }
  const pharmacies: Pharmacy[] = await fetchDocuments<Pharmacy>("pharmacies");
  return { pharmacies };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("action");

  try {
    switch (action) {
      case "create": {
        const pharmacy: Pharmacy = {
          name: formData.get("name") as string,
          address: formData.get("address") as string,
          phoneNumber: formData.get("phoneNumber") as string,
          code: formData.get("code") as string,
          id: "",
        };

        const [errors, createdPharmacy] = await createDocument<Pharmacy>("pharmacies", pharmacy);
        if (errors) {
          const values = Object.fromEntries(formData);
          return json({ errors, values });
        }
        return json({
          success: true,
          message: "Pharmacy created successfully!",
        });
      }
      case "edit": {
        const id = formData.get("id") as string;
        const pharmacy: Partial<Pharmacy> = {
          name: formData.get("name") as string,
          address: formData.get("address") as string,
          phoneNumber: formData.get("phoneNumber") as string,
          code: formData.get("code") as string,
        };

        await updateDocument<Pharmacy>("pharmacies", id, pharmacy);
        return json({
          success: true,
          message: "Pharmacy updated successfully!",
        });
      }
      case "delete": {
        const id = formData.get("id") as string;
        await deleteDocument("pharmacies", id);
        return json({
          success: true,
          message: "Pharmacy deleted successfully!",
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

export default function Pharmacies() {
  const { pharmacies } = useLoaderData<{ pharmacies: Pharmacy[] }>();
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
      <h1 className="text-3xl font-bold mb-6">Farmacias</h1>
      <PharmacyForm
        isSheetOpen={isSheetOpen}
        setIsSheetOpen={setIsSheetOpen}
        pharmacyToEdit={getPharmacyToEdit()}
        isCreating={isCreating}
        setIsCreating={setIsCreating}
        editingId={editingId}
        setEditingId={setEditingId}
      />
      <DataTable
        columns={pharmacyColumns({
          editAction: (id) => {
            setIsCreating(false);
            setEditingId(id);
            setIsSheetOpen(true);
          },
          navigation,
        })}
        data={pharmacies}
      />
    </div>
  );

  function getPharmacyToEdit() {
    return pharmacies.find((pharmacy) => pharmacy.id === editingId);
  }
}
