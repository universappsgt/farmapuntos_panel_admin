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
import { ImageUpload } from "~/components/custom/image-upload";
import { Card, CardContent } from "~/components/ui/card";

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
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [logoImage, setLogoImage] = useState<File | null>(null);

  useEffect(() => {
    if (actionData && actionData.success) {
      setIsSheetOpen(false);
      toast({
        title: actionData.message,
        variant: actionData.success ? "default" : "destructive",
      });
    }
  }, [actionData, setIsSheetOpen]);

  const handleSheetOpenChange = (open: boolean) => {
    if (!open) {
      // Clear the images when the sheet is dismissed
      setBackgroundImage(null);
      setLogoImage(null);
    }
    setIsSheetOpen(open);
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
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
        <Form method="post" className="space-y-4" encType="multipart/form-data">
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
                    <Label htmlFor="backgroundImage">Background Image</Label>
                    <Card className="mt-2">
                      <CardContent className="p-4">
                        {backgroundImage ||
                        fidelityCardToEdit?.cardDesign.backgroundImage ? (
                          <img
                            src={
                              backgroundImage
                                ? URL.createObjectURL(backgroundImage)
                                : fidelityCardToEdit?.cardDesign.backgroundImage
                            }
                            alt="Background Preview"
                            className="w-full h-40 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-full h-40 bg-muted flex items-center justify-center rounded-md">
                            No image
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    <ImageUpload
                      id="backgroundImage"
                      name="backgroundImage"
                      onImageUpload={(file) => setBackgroundImage(file)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="logo">Logo</Label>
                    <Card className="mt-2">
                      <CardContent className="p-4">
                        {logoImage || fidelityCardToEdit?.cardDesign.logo ? (
                          <img
                            src={
                              logoImage
                                ? URL.createObjectURL(logoImage)
                                : fidelityCardToEdit?.cardDesign.logo
                            }
                            alt="Logo Preview"
                            className="w-32 h-32 object-contain"
                          />
                        ) : (
                          <div className="w-32 h-32 bg-muted flex items-center justify-center rounded-md">
                            No logo
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    <ImageUpload
                      id="logo"
                      name="logo"
                      onImageUpload={(file) => setLogoImage(file)}
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
