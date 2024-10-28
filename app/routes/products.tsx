import { useEffect, useState } from "react";
import {
  useLoaderData,
  useActionData,
  json,
  useNavigation,
} from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { Product } from "~/models/types";
import { toast } from "sonner";
import {
  createDocument,
  deleteDocument,
  fetchDocuments,
  updateDocument,
} from "~/services/firestore.server";
import { DataTable } from "~/components/ui/data-table";
import { productColumns } from "~/components/custom/columns";
import { ProductForm } from "~/lib/features/products/product-form";

export const loader: LoaderFunction = async () => {
  const products: Product[] = await fetchDocuments<Product>("products");
  return { products };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("action");

  try {
    switch (action) {
      case "create": {
        const product: Product = {
          name: formData.get("name") as string,
          price: Number(formData.get("price")),
          awardedPoints: Number(formData.get("awardedPoints")),
          id: "",
        };

        const [errors, createdProduct] = await createDocument<Product>(
          "products",
          product
        );
        if (errors) {
          return json({
            success: false,
            message: "Failed to create product. Please check your input.",
          });
        }
        return json({
          success: true,
          message: "Product created successfully!",
        });
      }
      case "edit": {
        const id = formData.get("id") as string;
        if (!id) {
          return json({
            success: false,
            message: "Product ID is required for editing.",
          });
        }

        const product: Partial<Product> = {
          name: formData.get("name") as string,
          price: Number(formData.get("price")),
          awardedPoints: Number(formData.get("awardedPoints")),
        };

        await updateDocument<Product>("products", id, product);
        return json({
          success: true,
          message: "Product updated successfully!",
        });
      }
      case "delete": {
        const id = formData.get("id") as string;
        if (!id) {
          return json({
            success: false,
            message: "Product ID is required for deletion.",
          });
        }

        await deleteDocument("products", id);
        return json({
          success: true,
          message: "Product deleted successfully!",
        });
      }
      default:
        return json({
          success: false,
          message: "Invalid action specified.",
        });
    }
  } catch (error) {
    console.error("Error handling action:", error);
    return json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
    });
  }
};

export default function Products() {
  const { products } = useLoaderData<{ products: Product[] }>();
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
      <h1 className="text-3xl font-bold mb-6">Productos</h1>
      <ProductForm
        isSheetOpen={isSheetOpen}
        setIsSheetOpen={setIsSheetOpen}
        productToEdit={getProductToEdit()}
        isCreating={isCreating}
        setIsCreating={setIsCreating}
        editingId={editingId}
        setEditingId={setEditingId}
      />
      <DataTable
        columns={productColumns({
          editAction: (id) => {
            setIsCreating(false);
            setEditingId(id);
            setIsSheetOpen(true);
          },
          navigation,
        })}
        data={products}
      />
    </div>
  );

  function getProductToEdit() {
    return products.find((product) => product.id === editingId);
  }
}
