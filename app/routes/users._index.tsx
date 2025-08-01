import { useEffect, useState } from "react";
import {
  useLoaderData,
  json,
  useNavigation,
  useActionData,
  Link,
  useNavigate,
  redirect,
} from "@remix-run/react";
import { type LoaderFunction, type ActionFunction } from "@remix-run/node";
import { User } from "~/models/types";
import {
  createDocument,
  deleteDocument,
  fetchDocuments,
  updateDocument,
} from "~/services/firestore.server";
import { DataTable } from "~/components/ui/data-table";
import { userColumns } from "~/components/custom/columns";
import { UserForm } from "~/lib/features/users/user-form";
import { toast } from "sonner";
import { getCurrentUser } from "~/services/firebase-auth.server";

export const loader: LoaderFunction = async () => {
  const user = await getCurrentUser();  
  if (!user) {
    return redirect("/login");
  }

  const users: User[] = await fetchDocuments<User>("users", [
    "isAgent",
    "==",
    false,
  ]);
  return { users };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("action");

  try {
    switch (action) {
      case "create": {
        const user: User = {
          name: formData.get("name") as string,
          email: formData.get("email") as string,
          points: 0,
          phoneNumber: formData.get("phoneNumber") as string,
          profilePictureUrl: "",
          notificationTokens: [],
          backgroundPictureUrl: "",
          isAgent: false,
          id: "",
          accountStatus: formData.get("accountStatus") as "active" | "inactive" | "newAccount",
        };

        const [errors, createdUser] = await createDocument<User>("users", user);
        if (errors) {
          return json({ errors, values: Object.fromEntries(formData) });
        }
        return json({
          success: true,
          message: "User created successfully!",
        });
      }
      case "edit": {
        const id = formData.get("id") as string;
        const user: Partial<User> = {
          name: formData.get("name") as string,
          email: formData.get("email") as string,
          phoneNumber: formData.get("phoneNumber") as string,
          accountStatus: formData.get("accountStatus") as "active" | "inactive" | "newAccount",
        };

        await updateDocument<User>("users", id, user);
        return json({
          success: true,
          message: "User updated successfully!",
        });
      }
      case "delete": {
        const id = formData.get("id") as string;
        await deleteDocument("users", id);
        return json({
          success: true,
          message: "User deleted successfully!",
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

export default function Users() {
  const { users } = useLoaderData<{ users: User[] }>();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const navigation = useNavigation();
  const actionData = useActionData<{ success: boolean; message: string }>();
  const navigate = useNavigate();

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
      <h1 className="text-3xl font-bold mb-6">Usuarios</h1>
      <UserForm
        isSheetOpen={isSheetOpen}
        setIsSheetOpen={setIsSheetOpen}
        userToEdit={getUserToEdit()}
        isCreating={isCreating}
        setIsCreating={setIsCreating}
        editingId={editingId}
        setEditingId={setEditingId}
      />
      <DataTable
        columns={userColumns({
          editAction: (id) => {
            setIsCreating(false);
            setEditingId(id);
            setIsSheetOpen(true);
          },
          navigation,
        })}
        data={users}
      />
    </div>
  );

  function getUserToEdit() {
    return users.find((user) => user.id === editingId);
  }
}
