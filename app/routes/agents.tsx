import { useEffect, useState } from "react";
import {
  useLoaderData,
  Form,
  useActionData,
  json,
  useNavigation,
  redirect,
} from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

import { User } from "~/models/types";
import {
  createDocument,
  deleteDocument,
  fetchDocuments,
  updateDocument,
} from "~/services/firestore.server";
import { DataTable } from "~/components/ui/data-table";
import { agentColumns } from "~/components/custom/columns";
import { AgentForm } from "~/lib/features/agents/agent-form";
import { toast } from "sonner";
import { getCurrentUser } from "~/services/firebase-auth.server";

export const loader: LoaderFunction = async () => {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/login");
  }
  const agents: User[] = await fetchDocuments<User>("users", [
    "isAgent",
    "==",
    true,
  ]);
  return { agents };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("action");

  try {
    switch (action) {
      case "create": {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        // Create user in Firebase Auth
        const auth = getAuth();
        await createUserWithEmailAndPassword(auth, email, password);

        const agent: User = {
          name: formData.get("name") as string,
          email,
          points: 0,
          phoneNumber: formData.get("phoneNumber") as string,
          profilePictureUrl: formData.get("profilePictureUrl") as string,
          notificationTokens: [],
          backgroundPictureUrl: "",
          isEnabled: true,
          isAgent: true,
          id: "",
        };

        const [errors, createdAgent] = await createDocument<User>(
          "users",
          agent
        );
        if (errors) {
          const values = Object.fromEntries(formData);
          return json({ errors, values });
        }
        return json({
          success: true,
          message: "Agent created successfully!",
        });
      }
      case "edit": {
        const id = formData.get("id") as string;
        const agent: Partial<User> = {
          name: formData.get("name") as string,
          email: formData.get("email") as string,
          phoneNumber: formData.get("phoneNumber") as string,
          profilePictureUrl: formData.get("profilePictureUrl") as string,
        };

        await updateDocument<User>("users", id, agent);
        return json({
          success: true,
          message: "Agent updated successfully!",
        });
      }
      case "delete": {
        const id = formData.get("id") as string;
        await deleteDocument("users", id);
        return json({
          success: true,
          message: "Agent deleted successfully!",
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

export default function Agents() {
  const { agents } = useLoaderData<{ agents: User[] }>();
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
      <h1 className="text-3xl font-bold mb-6">Agentes</h1>
      <AgentForm
        isSheetOpen={isSheetOpen}
        setIsSheetOpen={setIsSheetOpen}
        agentToEdit={getAgentToEdit()}
        isCreating={isCreating}
        setIsCreating={setIsCreating}
        editingId={editingId}
        setEditingId={setEditingId}
      />
      <DataTable
        columns={agentColumns({
          editAction: (id) => {
            setIsCreating(false);
            setEditingId(id);
            setIsSheetOpen(true);
          },
          navigation,
        })}
        data={agents}
      />
    </div>
  );

  function getAgentToEdit() {
    return agents.find((agent) => agent.id === editingId);
  }
}
