import { useState, useEffect } from "react";
import { Form, useNavigation, useActionData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { FidelityCard } from "~/models/types";
import { toast } from "~/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

interface FidelityCardFormProps {
  fidelityCardToEdit: FidelityCard | undefined;
  isCreating: boolean;
  setIsCreating: (value: boolean) => void;
  editingId: string | null;
  setEditingId: (value: string | null) => void;
  isSheetOpen: boolean;
  setIsSheetOpen: (value: boolean) => void;
}

export function FidelityCardForm({
  fidelityCardToEdit,
  isCreating,
  setIsCreating,
  editingId,
  setEditingId,
  isSheetOpen,
  setIsSheetOpen,
}: FidelityCardFormProps) {
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
          + Agregar
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[50vw] sm:max-w-[50vw] overflow-y-auto"
      >
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
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="rules">Rules</TabsTrigger>
              </TabsList>
              <TabsContent value="general">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardTitle">Card Title</Label>
                    <Input
                      id="cardTitle"
                      name="cardTitle"
                      required
                      defaultValue={fidelityCardToEdit?.cardTitle || ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      required
                      defaultValue={fidelityCardToEdit?.description || ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="backgroundImage">
                      Background Image URL
                    </Label>
                    <Input
                      id="backgroundImage"
                      name="cardDesign.backgroundImage"
                      defaultValue={
                        fidelityCardToEdit?.cardDesign.backgroundImage || ""
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="logo">Logo URL</Label>
                    <Input
                      id="logo"
                      name="cardDesign.logo"
                      defaultValue={fidelityCardToEdit?.cardDesign.logo || ""}
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="contact">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="locationUrl">Location URL</Label>
                    <Input
                      id="locationUrl"
                      name="contact.locationUrl"
                      defaultValue={
                        fidelityCardToEdit?.contact.locationUrl || ""
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      name="contact.phoneNumber"
                      defaultValue={
                        fidelityCardToEdit?.contact.phoneNumber || ""
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="contact.website"
                      defaultValue={fidelityCardToEdit?.contact.website || ""}
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="rules">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Input
                      id="currency"
                      name="rules.currency"
                      defaultValue={fidelityCardToEdit?.rules.currency || ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="forPurchasePrice">For Purchase Price</Label>
                    <Input
                      id="forPurchasePrice"
                      name="rules.forPurchasePrice"
                      type="number"
                      defaultValue={
                        fidelityCardToEdit?.rules.forPurchasePrice || 0
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="initialCredits">Initial Credits</Label>
                    <Input
                      id="initialCredits"
                      name="rules.initialCredits"
                      type="number"
                      defaultValue={
                        fidelityCardToEdit?.rules.initialCredits || 0
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="rewardPoints">Reward Points</Label>
                    <Input
                      id="rewardPoints"
                      name="rules.rewardPoints"
                      defaultValue={
                        fidelityCardToEdit?.rules.rewardPoints || ""
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      name="rules.status"
                      defaultValue={fidelityCardToEdit?.rules.status || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
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
