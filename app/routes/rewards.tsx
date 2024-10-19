import { useEffect, useState } from "react";
import {
  useLoaderData,
  Form,
  useActionData,
  json,
  useNavigation,
} from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { Reward } from "~/models/types";
import {
  createDocument,
  deleteDocument,
  fetchDocuments,
  updateDocument,
} from "~/services/firestore.server";
import { toast } from "~/hooks/use-toast";
import { DataTable } from "~/components/ui/data-table";
import { rewardColumns } from "~/components/custom/columns";
import { RewardForm } from "~/lib/features/rewards/reward-form";

export const loader: LoaderFunction = async () => {
  const rewards: Reward[] = await fetchDocuments<Reward>("rewards");
  return { rewards };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("action");

  try {
    switch (action) {
      case "create": {
        const reward: Reward = {
          name: formData.get("name") as string,
          imageUrl: formData.get("imageUrl") as string,
          expirationDate: new Date(formData.get("expirationDate") as string),
          worthPoints: Number(formData.get("worthPoints")),
          stock: Number(formData.get("stock")),
          id: "",
        };

        const [errors, createdReward] = await createDocument<Reward>("rewards", reward);
        if (errors) {
          const values = Object.fromEntries(formData);
          return json({ errors, values });
        }
        return json({
          success: true,
          message: "Reward created successfully!",
        });
      }
      case "edit": {
        const id = formData.get("id") as string;
        const reward: Partial<Reward> = {
          name: formData.get("name") as string,
          imageUrl: formData.get("imageUrl") as string,
          expirationDate: new Date(formData.get("expirationDate") as string),
          worthPoints: Number(formData.get("worthPoints")),
          stock: Number(formData.get("stock")),
        };

        await updateDocument<Reward>("rewards", id, reward);
        return json({
          success: true,
          message: "Reward updated successfully!",
        });
      }
      case "delete": {
        const id = formData.get("id") as string;
        await deleteDocument("rewards", id);
        return json({
          success: true,
          message: "Reward deleted successfully!",
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

export default function Rewards() {
  const { rewards } = useLoaderData<{ rewards: Reward[] }>();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const navigation = useNavigation();

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Rewards</h1>
      <RewardForm
        isSheetOpen={isSheetOpen}
        setIsSheetOpen={setIsSheetOpen}
        rewardToEdit={getRewardToEdit()}
        isCreating={isCreating}
        setIsCreating={setIsCreating}
        editingId={editingId}
        setEditingId={setEditingId}
      />
      <DataTable
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
    return rewards.find((reward) => reward.id === editingId);
  }
}
