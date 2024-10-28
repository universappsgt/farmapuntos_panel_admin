import { useEffect, useState } from "react";
import {
  useLoaderData,
  Form,
  useActionData,
  json,
  useNavigation,
} from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { Laboratory } from "~/models/types";
import {
  createDocument,
  deleteDocument,
  fetchDocuments,
  updateDocument,
} from "~/services/firestore.server";
import { toast } from "sonner";
import { DataTable } from "~/components/ui/data-table";
import { laboratoryColumns } from "~/components/custom/columns";
import { LaboratoryForm } from "~/lib/features/laboratories/laboratory-form";

export const loader: LoaderFunction = async () => {
  const laboratories: Laboratory[] = await fetchDocuments<Laboratory>(
    "laboratories"
  );

  return { laboratories };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("action");

  try {
    switch (action) {
      case "create": {
        const name = formData.get("name");
        const location = formData.get("location");
        const laboratory: Laboratory = {
          name: name as string,
          location: location as string,
          specialization: formData.get("specialization") as string,
          contactNumber: formData.get("contactNumber") as string,
          id: "",
        };

        const [errors, project] = await createDocument<Laboratory>(
          "laboratories",
          laboratory
        );
        if (errors) {
          const values = Object.fromEntries(formData);
          return json({ errors, values });
        }
        return json({
          success: true,
          message: "¡Laboratorio creado exitosamente!",
        });
      }
      case "edit": {
        const id = formData.get("id");
        const name = formData.get("name");
        const location = formData.get("location");
        const laboratory: Laboratory = {
          name: name as string,
          location: location as string,
          specialization: formData.get("specialization") as string,
          contactNumber: formData.get("contactNumber") as string,
          id: id as string,
        };

        await updateDocument<Laboratory>(
          "laboratories",
          id as string,
          laboratory
        );
        return json({
          success: true,
          message: "¡Laboratorio actualizado exitosamente!",
        });
      }
      case "delete": {
        const id = formData.get("id");
        await deleteDocument("laboratories", id as string);
        return json({
          success: true,
          message: "Laboratory deleted successfully!",
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

export default function Laboratories() {
  const { laboratories } = useLoaderData<{ laboratories: Laboratory[] }>();
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
      <h1 className="text-3xl font-bold mb-6">Laboratorios</h1>
      <LaboratoryForm
        isSheetOpen={isSheetOpen}
        setIsSheetOpen={setIsSheetOpen}
        laboratories={laboratories}
        isCreating={isCreating}
        setIsCreating={setIsCreating}
        editingId={editingId}
        setEditingId={setEditingId}
      />

      <DataTable
        columns={laboratoryColumns({
          editAction: (id) => {
            setIsCreating(false);
            setEditingId(id);
            setIsSheetOpen(true);
          },
          navigation,
        })}
        data={laboratories}
      />
    </div>
  );
}
