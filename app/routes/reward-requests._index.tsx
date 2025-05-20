import { useState, useEffect } from "react";
import {
  useLoaderData,
  json,
  useNavigation,
  useActionData,
} from "@remix-run/react";
import type { LoaderFunction, ActionFunction, SerializeFrom } from "@remix-run/node";
import { RewardRequest, RewardRequestStatus } from "~/models/types";
import {
  createDocument,
  deleteDocument,
  fetchRewardRequests,
  updateDocument,
} from "~/services/firestore.server";
import { DataTable } from "~/components/ui/data-table";
import { rewardRequestColumns } from "~/components/custom/columns";
import { RewardRequestForm } from "~/lib/features/reward-requests/reward-request-form";
import { toast } from "sonner";

export const loader: LoaderFunction = async () => {
  const rewardRequests: RewardRequest[] = await fetchRewardRequests(
    "rewardRequests"
  );

  return { rewardRequests };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("action");

  try {
    switch (action) {
      case "edit": {
        const id = formData.get("id") as string;
        const rewardRequest: Partial<RewardRequest> = {
          status: formData.get("status") as RewardRequestStatus,
        };

        await updateDocument<RewardRequest>("rewardRequests", id, rewardRequest);
        return json({
          success: true,
          message: "Solicitud actualizada exitosamente!",
        });
      }
      case "delete": {
        const id = formData.get("id") as string;
        await deleteDocument("rewardRequests", id);
        return json({
          success: true,
          message: "Solicitud eliminada exitosamente!",
        });
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

export default function RewardRequests() {
  const { rewardRequests } = useLoaderData<{ rewardRequests: RewardRequest[] }>();
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
      <h1 className="text-3xl font-bold mb-6">Solicitudes de Canjeo</h1>
      <DataTable<SerializeFrom<RewardRequest>>
        columns={rewardRequestColumns({
          editAction: (id) => { 
            setEditingId(id);
            setIsSheetOpen(true);
          },
          navigation,
        })}
        data={rewardRequests}
      />
    </div>
  );

} 