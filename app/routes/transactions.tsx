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
import { Transaction } from "~/models/types";
import {
  createDocument,
  deleteDocument,
  fetchDocuments,
  updateDocument,
} from "~/services/firestore.server";
import { toast } from "~/hooks/use-toast";
import { DataTable } from "~/components/ui/data-table";
import { transactionColumns } from "~/components/custom/columns";
import { TransactionForm } from "~/lib/features/transactions/transaction-form";

export const loader: LoaderFunction = async () => {
  const transactions: Transaction[] = await fetchDocuments<Transaction>("transactions");
  return { transactions };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("action");

  try {
    switch (action) {
      case "create": {
        const transaction: Transaction = {
          createdAt: new Date(),
          userId: formData.get("userId") as string,
          agentId: formData.get("agentId") as string,
          agentSignatureUrl: formData.get("agentSignatureUrl") as string,
          clientSignatureUrl: formData.get("clientSignatureUrl") as string,
          evidenceImageUrl: formData.get("evidenceImageUrl") as string,
          rewardPoints: Number(formData.get("rewardPoints")),
          transactionStatus: formData.get("transactionStatus") as TransactionStatus,
          transactionType: formData.get("transactionType") as TransactionType,
          id: "",
        };

        const [errors, createdTransaction] = await createDocument<Transaction>(
          "transactions",
          transaction
        );
        if (errors) {
          const values = Object.fromEntries(formData);
          return json({ errors, values });
        }
        return json({
          success: true,
          message: "Transaction created successfully!",
        });
      }
      case "edit": {
        const id = formData.get("id") as string;
        const transaction: Partial<Transaction> = {
          userId: formData.get("userId") as string,
          agentId: formData.get("agentId") as string,
          agentSignatureUrl: formData.get("agentSignatureUrl") as string,
          clientSignatureUrl: formData.get("clientSignatureUrl") as string,
          evidenceImageUrl: formData.get("evidenceImageUrl") as string,
          rewardPoints: Number(formData.get("rewardPoints")),
          transactionStatus: formData.get("transactionStatus") as TransactionStatus,
          transactionType: formData.get("transactionType") as TransactionType,
        };

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

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Transactions</h1>
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
        data={transactions}
      />
    </div>
  );

  function getTransactionToEdit() {
    return transactions.find((transaction) => transaction.id === editingId);
  }
}
