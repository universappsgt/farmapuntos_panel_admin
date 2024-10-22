import { useEffect, useState } from "react";
import {
  useLoaderData,
  Form,
  useActionData,
  json,
  useNavigation,
} from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { Product } from "~/models/types";
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
          worthPoints: Number(formData.get("worthPoints")),
          id: "",
        };

        const [errors, createdProduct] = await createDocument<Product>("products", product);
        if (errors) {
          const values = Object.fromEntries(formData);
          return json({ errors, values });
        }
        return json({
          success: true,
          message: "Product created successfully!",
        });
      }
      case "edit": {
        const id = formData.get("id") as string;
        const product: Partial<Product> = {
          name: formData.get("name") as string,
          price: Number(formData.get("price")),
          worthPoints: Number(formData.get("worthPoints")),
        };

        await updateDocument<Product>("products", id, product);
        return json({
          success: true,
          message: "Product updated successfully!",
        });
      }
      case "delete": {
        const id = formData.get("id") as string;
        await deleteDocument("products", id);
        return json({
          success: true,
          message: "Product deleted successfully!",
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

export default function Products() {
  const { products } = useLoaderData<{ products: Product[] }>();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const navigation = useNavigation();

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Products</h1>
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
