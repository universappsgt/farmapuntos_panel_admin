import { useEffect } from "react";
import { useFetcher } from "@remix-run/react";
import { Banner } from "~/models/types";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";

interface ActionData {
  success: boolean;
  message: string;
}

interface BannerFormProps {
  isSheetOpen: boolean;
  setIsSheetOpen: (open: boolean) => void;
  bannerToEdit?: Banner;
  isCreating: boolean;
  setIsCreating: (creating: boolean) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
}

export function BannerForm({
  isSheetOpen,
  setIsSheetOpen,
  bannerToEdit,
  isCreating,
  setIsCreating,
  editingId,
  setEditingId,
}: BannerFormProps) {
  const fetcher = useFetcher<ActionData>();

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success) {
      setIsSheetOpen(false);
      setIsCreating(false);
      setEditingId(null);
    }
  }, [fetcher.state, fetcher.data, setIsSheetOpen, setIsCreating, setEditingId]);

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button
          onClick={() => {
            setIsCreating(true);
            setEditingId(null);
          }}
        >
          Crear Banner
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {isCreating ? "Crear Banner" : "Editar Banner"}
          </SheetTitle>
        </SheetHeader>
        <p className="text-sm text-muted-foreground">
          Se recomienda utilizar una proporción de imagen de 8:3
        </p>
        <fetcher.Form
          method="post"
          className="space-y-4 mt-4"
          encType="multipart/form-data"
        >
          <input type="hidden" name="action" value="edit" />
          {bannerToEdit?.id && (
            <input type="hidden" name="id" value={bannerToEdit.id} />
          )}
          {bannerToEdit?.img && (
            <input type="hidden" name="currentImg" value={bannerToEdit.img} />
          )}
          <div className="space-y-2">
            <Label htmlFor="img">Imagen del banner</Label>
            <Input
              id="img"
              name="img"
              type="file"
              accept="image/*"
              required={isCreating}
            />
            {bannerToEdit?.img && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground">Imagen actual:</p>
                <img 
                  src={bannerToEdit.img} 
                  alt="Banner actual" 
                  className="mt-2 max-h-32 object-contain"
                />
              </div>
            )}
          </div>
          <Button type="submit" className="w-full">
            {isCreating ? "Crear" : "Actualizar"}
          </Button>
        </fetcher.Form>
      </SheetContent>
    </Sheet>
  );
} 