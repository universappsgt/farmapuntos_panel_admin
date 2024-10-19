import { useState, useEffect } from "react";
import { Form, useNavigation, useActionData } from "@remix-run/react";
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
import { Transaction, TransactionStatus, TransactionType } from "~/models/types";
import { toast } from "~/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

interface TransactionFormProps {
  transactionToEdit: Transaction | undefined;
  isCreating: boolean;
  setIsCreating: (value: boolean) => void;
  editingId: string | null;
  setEditingId: (value: string | null) => void;
  isSheetOpen: boolean;
  setIsSheetOpen: (value: boolean) => void;
}

export function TransactionForm({
  transactionToEdit,
  isCreating,
  setIsCreating,
  editingId,
  setEditingId,
  isSheetOpen,
  setIsSheetOpen,
}: TransactionFormProps) {
  const navigation = useNavigation();
  const actionData = useActionData<{ success: boolean; message: string }>();

  useEffect(() => {
    if (actionData && actionData.success) {
      setIsSheetOpen(false);
      toast({
        title: actionData.message,
        variant: actionData.success ? "default" : "destructive",
      });
    }
  }, [actionData, setIsSheetOpen]);

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button
          className="mb-4"
          onClick={() => {
            setIsCreating(true);
            setEditingId(null);
          }}
        >
          + Add Transaction
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {isCreating ? "Create New Transaction" : "Edit Transaction"}
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
            <div className="mb-4">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                name="userId"
                required
                defaultValue={transactionToEdit?.userId || ""}
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="agentId">Agent ID</Label>
              <Input
                id="agentId"
                name="agentId"
                required
                defaultValue={transactionToEdit?.agentId || ""}
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="rewardPoints">Reward Points</Label>
              <Input
                id="rewardPoints"
                name="rewardPoints"
                type="number"
                required
                defaultValue={transactionToEdit?.rewardPoints || 0}
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="transactionStatus">Transaction Status</Label>
              <Select name="transactionStatus" defaultValue={transactionToEdit?.transactionStatus || TransactionStatus.InProgress}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TransactionStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mb-4">
              <Label htmlFor="transactionType">Transaction Type</Label>
              <Select name="transactionType" defaultValue={transactionToEdit?.transactionType || TransactionType.Credit}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TransactionType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mb-4">
              <Label htmlFor="agentSignatureUrl">Agent Signature URL</Label>
              <Input
                id="agentSignatureUrl"
                name="agentSignatureUrl"
                defaultValue={transactionToEdit?.agentSignatureUrl || ""}
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="clientSignatureUrl">Client Signature URL</Label>
              <Input
                id="clientSignatureUrl"
                name="clientSignatureUrl"
                defaultValue={transactionToEdit?.clientSignatureUrl || ""}
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="evidenceImageUrl">Evidence Image URL</Label>
              <Input
                id="evidenceImageUrl"
                name="evidenceImageUrl"
                defaultValue={transactionToEdit?.evidenceImageUrl || ""}
              />
            </div>
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
  );
}
