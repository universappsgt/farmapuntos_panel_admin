import { useEffect, useState } from "react";
import {
  useLoaderData,
  json,
  useNavigation,
  useActionData,
  redirect,
} from "@remix-run/react";
import type {
  LoaderFunction,
  ActionFunction,
  SerializeFrom,
} from "@remix-run/node";
import { Reward } from "~/models/types";
import {
  createDocument,
  deleteDocument,
  fetchDocuments,
  updateDocument,
} from "~/services/firestore.server";
import { DataTable } from "~/components/ui/data-table";
import { rewardColumns } from "~/components/custom/columns";
import { RewardForm } from "~/lib/features/rewards/reward-form";
import { toast } from "sonner";

import { parseISO } from "date-fns";
import { uploadImage } from "~/services/firebase-storage.server";
import { getCurrentUser } from "~/services/firebase-auth.server";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getCurrentUser(request);
  if (!user) {
    return redirect("/login");
  }

  const rewards: Reward[] = await fetchDocuments<Reward>("rewards");
  return { rewards };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("action");

  try {
    switch (action) {
      case "create": {
        const imageFile = formData.get("imageUrl") as File;
        let imageUrl = "";

        if (imageFile && imageFile.size > 0) {
          const arrayBuffer = await imageFile.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          imageUrl = await uploadImage(buffer, imageFile.name, "rewards");
        }

        const reward: Reward = {
          name: formData.get("name") as string,
          imageUrl,
          expirationDate: new Date(formData.get("expirationDate") as string),
          awardedPoints: Number(formData.get("awardedPoints")),
          stock: Number(formData.get("stock")),
          id: "",
        };

        const [errors, createdReward] = await createDocument<Reward>(
          "rewards",
          reward
        );

        if (errors) {
          return json({
            success: false,
            message: "Error al crear la recompensa. Por favor, intente nuevamente.",
          });
        }

        return json({
          success: true,
          message: "Recompensa creada exitosamente!",
        });
      }
      case "edit": {
        const id = formData.get("id") as string;
        const imageFile = formData.get("imageUrl") as File;
        const currentImageUrl = formData.get("currentImageUrl") as string;
        let imageUrl = currentImageUrl || "";

        if (imageFile && imageFile.size > 0) {
          const arrayBuffer = await imageFile.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          imageUrl = await uploadImage(buffer, imageFile.name, "rewards");
        }

        const reward: Partial<Reward> = {
          name: formData.get("name") as string,
          imageUrl,
          expirationDate: new Date(formData.get("expirationDate") as string),
          awardedPoints: Number(formData.get("awardedPoints")),
          stock: Number(formData.get("stock")),
        };

        try {
          await updateDocument<Reward>("rewards", id, reward);
          return json({
            success: true,
            message: "Recompensa actualizada exitosamente!",
          });
        } catch (error) {
          return json({
            success: false,
            message: "Error al actualizar la recompensa. Por favor, intente nuevamente.",
          });
        }
      }
      case "delete": {
        const id = formData.get("id") as string;
        try {
          await deleteDocument("rewards", id);
          return json({
            success: true,
            message: "Recompensa eliminada exitosamente!",
          });
        } catch (error) {
          return json({
            success: false,
            message: "Error al eliminar la recompensa. Por favor, intente nuevamente.",
          });
        }
      }
      default:
        return json({
          success: false,
          message: "Acción no válida",
        });
    }
  } catch (error) {
    console.error("Error handling action:", error);
    return json({
      success: false,
      message: "Ocurrió un error. Por favor, intente nuevamente.",
    });
  }
};

export default function Rewards() {
  const { rewards } = useLoaderData<{ rewards: Reward[] }>();
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
      <h1 className="text-3xl font-bold mb-6">Recompensas</h1>
      <RewardForm
        isSheetOpen={isSheetOpen}
        setIsSheetOpen={setIsSheetOpen}
        rewardToEdit={getRewardToEdit()}
        isCreating={isCreating}
        setIsCreating={setIsCreating}
        editingId={editingId}
        setEditingId={setEditingId}
      />
      <DataTable<SerializeFrom<Reward>>
        columns={rewardColumns({
          editAction: (id) => {
            setIsCreating(false);
            setEditingId(id);
            setIsSheetOpen(true);
          },
          navigation,
        })}
        data={rewards}
      />
    </div>
  );

  function getRewardToEdit() {
    const reward = rewards.find((reward) => reward.id === editingId);
    return reward
      ? {
          ...reward,
          expirationDate: parseISO(reward.expirationDate as unknown as string),
        }
      : undefined;
  }
}
