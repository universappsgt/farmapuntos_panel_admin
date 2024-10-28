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
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from "~/models/types";
import { toast } from "~/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

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
      <SheetContent className="overflow-y-auto">
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
              <Label>User</Label>
              <div>{transactionToEdit?.client.name || "N/A"}</div>
            </div>
            <div className="mb-4">
              <Label>Agent</Label>
              <div>{transactionToEdit?.agent.name || "N/A"}</div>
            </div>
            <div className="mb-4">
              <Label>Reward Points</Label>
              <div>{transactionToEdit?.rewardPoins || 0}</div>
            </div>
            <div className="mb-4">
              <Label htmlFor="transactionStatus">Transaction Status</Label>
              <Select
                name="transactionStatus"
                defaultValue={
                  transactionToEdit?.transactionStatus ||
                  TransactionStatus.InProgress
                }
              >
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
              <Select
                name="transactionType"
                defaultValue={
                  transactionToEdit?.transactionType || TransactionType.Credit
                }
              >
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
              <Label>Agent Signature URL</Label>
              {transactionToEdit?.agentSignatureUrl && (
                <img
                  src={transactionToEdit.agentSignatureUrl}
                  alt="Agent Signature"
                  className="w-full h-40 object-cover rounded-md"
                  style={{ objectFit: "contain" }}
                />
              )}
            </div>
            <div className="mb-4">
              <Label>Client Signature URL</Label>
              {transactionToEdit?.clientSignatureUrl && (
                <img
                  src={transactionToEdit.clientSignatureUrl}
                  alt="Client Signature"
                  className="w-full h-40 object-cover rounded-md"
                  style={{ objectFit: "contain" }}
                />
              )}
            </div>
            <div className="mb-4">
              <Label>Evidence Image URL</Label>
              {transactionToEdit?.evidenceImageUrl && (
                <img
                  src={transactionToEdit.evidenceImageUrl}
                  alt="Evidence"
                  className="w-full h-40 object-cover rounded-md"
                  style={{ objectFit: "contain" }}
                />
              )}
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
