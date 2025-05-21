import { useState, useEffect } from "react";
import {
  useLoaderData,
  json,
  useNavigation,
  useActionData,
  Form,
} from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { Banner } from "~/models/types";
import {
  createDocument,
  deleteDocument,
  fetchDocuments,
  updateDocument,
} from "~/services/firestore.server";
import { DataTable } from "~/components/ui/data-table";
import { BannerForm } from "~/lib/features/banners/banner-form";
import { bannerColumns } from "~/components/custom/banner-columns";
import { toast } from "sonner";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { uploadImage } from "~/services/firebase-storage.server";

export const loader: LoaderFunction = async () => {
  const banners: Banner[] = await fetchDocuments("banners");
  return { banners };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("action");

  try {
    switch (action) {
      case "create": {
        const imageFile = formData.get("img") as File;
        let imgUrl = "";

        if (imageFile && imageFile.size > 0) {
          const arrayBuffer = await imageFile.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          imgUrl = await uploadImage(buffer, imageFile.name, "banners");
        }

        const banner: Banner = {
          img: imgUrl,
          id: "",
        };

        await createDocument<Banner>("banners", banner);
        return json({
          success: true,
          message: "Banner creado exitosamente!",
        });
      }
      case "edit": {
        const id = formData.get("id") as string;
        const imageFile = formData.get("img") as File;
        
        let imgUrl = formData.get("currentImg") as string;

        // Si hay un nuevo archivo, subirlo a Storage
        if (imageFile && imageFile.size > 0) {
          const arrayBuffer = await imageFile.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          imgUrl = await uploadImage(buffer, imageFile.name, "banners");
        }

        const banner: Partial<Banner> = {
          img: imgUrl,
        };

        // Remove empty, null, or undefined fields
        Object.keys(banner).forEach(
          (key) =>
            (banner[key as keyof typeof banner] === undefined ||
              banner[key as keyof typeof banner] === null ||
              banner[key as keyof typeof banner] === "") &&
            delete banner[key as keyof typeof banner]
        );

        if (id) {
          await updateDocument<Banner>("banners", id, banner);
        } else {
          await createDocument<Banner>("banners", banner as Banner);
        }

        return json({
          success: true,
          message: "Banner actualizado exitosamente!",
        });
      }
      case "delete": {
        const id = formData.get("id") as string;
        await deleteDocument("banners", id);
        return json({
          success: true,
          message: "Banner eliminado exitosamente!",
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

export default function Banners() {
  const { banners } = useLoaderData<{ banners: Banner[] }>();
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
      <h1 className="text-3xl font-bold mb-6">Banners</h1>
      <BannerForm
        isSheetOpen={isSheetOpen}
        setIsSheetOpen={setIsSheetOpen}
        bannerToEdit={getBannerToEdit()}
        isCreating={isCreating}
        setIsCreating={setIsCreating}
        editingId={editingId}
        setEditingId={setEditingId}
      />
      <DataTable
        columns={bannerColumns({
          editAction: (id: string) => {
            setIsCreating(false);
            setEditingId(id);
            setIsSheetOpen(true);
          },
          navigation,
        })}
        data={banners}
        showFilter={false}
      />
      
      {/* Formulario para eliminar banners */}
      <Form id="delete-form" method="post">
        <input type="hidden" name="action" value="delete" />
      </Form>
    </div>
  );

  function getBannerToEdit() {
    return banners.find((banner) => banner.id === editingId);
  }
} 