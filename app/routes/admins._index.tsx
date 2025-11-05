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
import { adminColumns } from "~/components/custom/columns";
import { AdminForm } from "~/lib/features/admins/admin-form";
import { toast } from "sonner";
import { createUserWithEmailAndPassword, deleteUser, getAuth } from "firebase/auth";
import { auth } from "firebase";
import { getCurrentUser } from "~/services/firebase-auth.server";

export const loader: LoaderFunction = async ({ request }) => {
    const user = await getCurrentUser(request);
    if (!user) {
        return redirect("/login");
    }
    const admins: User[] = await fetchDocuments<User>("users", [
        "isAdministrator",
        "==",
        true,
    ]);
    return { admins };
};

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const action = formData.get("action");

    try {
        switch (action) {
            case "create": {
                const password = formData.get("password") as string;
                const confirmPassword = formData.get("confirmPassword") as string;
                const email = formData.get("email") as string;
                const name = formData.get("name") as string;

                if (password !== confirmPassword) {
                    return json({
                        success: false,
                        message: "Las contraseñas no coinciden",
                    });
                }

                // Crear usuario en Firebase Auth
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);

                // Crear usuario en Firestore
                const user: User = {
                    id: userCredential.user.uid, // Usar el UID de Firebase Auth
                    name,
                    email,
                    points: 0,
                    phoneNumber: formData.get("phoneNumber") as string,
                    profilePictureUrl: "",
                    notificationTokens: [],
                    backgroundPictureUrl: "",
                    isAgent: false,
                    isAdministrator: true,
                    accountStatus: formData.get("accountStatus") as "active" | "inactive" | "newAccount",
                };

                const [errors, createdUser] = await createDocument<User>("users", user, userCredential.user.uid);
                if (errors) {
                    // Si hay error en Firestore, eliminar el usuario de Firebase Auth
                    try {
                        await deleteUser(userCredential.user);
                    } catch (deleteError) {
                        console.error("Error deleting Firebase Auth user after Firestore error:", deleteError);
                    }
                    return json({ errors, values: Object.fromEntries(formData) });
                }

                return json({
                    success: true,
                    message: "Administrador creado exitosamente!",
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
                    message: "Administrador actualizado exitosamente!",
                });
            }
            case "delete": {
                const id = formData.get("id") as string;
                await deleteDocument("users", id);
                return json({
                    success: true,
                    message: "Administrador eliminado exitosamente!",
                });
            }
        }
    } catch (error) {
        console.error("Error handling action:", error);
        return json({
            success: false,
            message: "Ocurrió un error. Por favor intente nuevamente.",
        });
    }
};

export default function Admins() {
    const { admins } = useLoaderData<{ admins: User[] }>();
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
            <h1 className="text-3xl font-bold mb-6">Administradores</h1>
            <AdminForm
                isSheetOpen={isSheetOpen}
                setIsSheetOpen={setIsSheetOpen}
                adminToEdit={getAdminToEdit()}
                isCreating={isCreating}
                setIsCreating={setIsCreating}
                editingId={editingId}
                setEditingId={setEditingId}
            />
            <DataTable
                columns={adminColumns({
                    editAction: (id) => {
                        setIsCreating(false);
                        setEditingId(id);
                        setIsSheetOpen(true);
                    },
                    navigation,
                })}
                data={admins}
            />
        </div>
    );

    function getAdminToEdit() {
        return admins.find((admin) => admin.id === editingId);
    }
} 