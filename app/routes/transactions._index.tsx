import { useState, useEffect } from "react";
import {
  useLoaderData,
  json,
  useNavigation,
  useActionData,
} from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import {
  Transaction,
  TransactionStatus,
  TransactionType,
  User,
} from "~/models/types";
import {
  createDocument,
  deleteDocument,
  fetchTransactions,
  updateDocument,
} from "~/services/firestore.server";
import { DataTable } from "~/components/ui/data-table";
import { transactionColumns } from "~/components/custom/columns";
import { TransactionForm } from "~/lib/features/transactions/transaction-form";
import { toast } from "sonner";

export const loader: LoaderFunction = async () => {
  const transactions: Transaction[] = await fetchTransactions(
    "transactions"
  );

  return { transactions };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("action");

  try {
    switch (action) {
      case "edit": {

        


        const id = formData.get("id") as string;
        const transaction: Partial<Transaction> = {
          userId: formData.get("userId") as string,
          agentId: formData.get("agentId") as string,
          agentSignatureUrl: formData.get("agentSignatureUrl") as string,
          userSignatureUrl: formData.get("userSignatureUrl") as string,
          evidenceImageUrl: formData.get("evidenceImageUrl") as string,
          points: Number(formData.get("points")),
          status: formData.get("status") as TransactionStatus,
          type: formData.get("type") as TransactionType,
        };

        // Remove empty, null, or undefined fields
        Object.keys(transaction).forEach(
          (key) =>
            (transaction[key as keyof typeof transaction] === undefined ||
              transaction[key as keyof typeof transaction] === null ||
              transaction[key as keyof typeof transaction] === "") &&
            delete transaction[key as keyof typeof transaction]
        );

        await updateDocument<Transaction>("transactions", id, transaction);
        return json({
          success: true,
          message: "Transaction updated successfully!",
        });
      }
      case "delete": {
        const id = formData.get("id") as string;
        await deleteDocument("transactions", id);
        return json({
          success: true,
          message: "Transaction deleted successfully!",
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

export default function Transactions() {
  const { transactions } = useLoaderData<{ transactions: Transaction[] }>();
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
      <h1 className="text-3xl font-bold mb-6">Transacciones</h1>
      <TransactionForm
        isSheetOpen={isSheetOpen}
        setIsSheetOpen={setIsSheetOpen}
        transactionToEdit={getTransactionToEdit()}
        isCreating={isCreating}
        setIsCreating={setIsCreating}
        editingId={editingId}
        setEditingId={setEditingId}
      />
      <DataTable
        columns={transactionColumns({
          editAction: (id) => {
            setIsCreating(false);
            setEditingId(id);
            setIsSheetOpen(true);
          },
          navigation,
        })}
        data={transactions as unknown as Transaction[]}
      />
    </div>
  );

  function getTransactionToEdit() {
    return transactions.find((transaction) => transaction.id === editingId) as unknown as Transaction | undefined;
  }
}
