import { useEffect, useState } from "react";
import {
  useLoaderData,
  json,
  useRouteError,
  Link,
  useNavigation,
  useActionData,
} from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Form } from "@remix-run/react";
import {
  fetchDocument,
  fetchDocuments,
  createDocument,
  deleteDocument,
} from "~/services/firestore.server";
import type { User, FidelityCard, UserCard } from "~/models/types";
import { CreditCard, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Label } from "~/components/ui/label";
import { toast } from "sonner";

interface LoaderData {
  user: User;
  userFidelityCards: (FidelityCard & { userPoints: number })[];
  cards: FidelityCard[];
}

export const loader: LoaderFunction = async ({ params }) => {
  const userId = params.userId;
  if (!userId) {
    throw new Response("User ID is required", { status: 400 });
  }
  const user = await fetchDocument<User>("users", userId);
  const fidelityCards = await fetchDocuments<FidelityCard>("cards");
  const userCards = await fetchDocuments<UserCard>("userCards", [
    "userId",
    "==",
    userId,
  ]);

  const cards = await fetchDocuments<FidelityCard>("cards");

  const userFidelityCards = fidelityCards
    .filter((fidelityCard) =>
      userCards.some((userCard) => userCard.fidelityCardId === fidelityCard.id)
    )
    .map((fidelityCard) => {
      const userCard = userCards.find(
        (uc) => uc.fidelityCardId === fidelityCard.id
      );
      return {
        ...fidelityCard,
        userPoints: userCard?.points || 0,
      };
    });

  console.log("userFidelityCards:", userFidelityCards);

  if (!user) {
    throw new Response("User not found", { status: 404 });
  }

  return json<LoaderData>({ user, userFidelityCards, cards });
};

export const action: ActionFunction = async ({
  request,
}: {
  request: Request;
}) => {
  const formData = await request.formData();
  const action = formData.get("action");

  try {
    switch (action) {
      case "attachCard": {
        const userId = formData.get("userId") as string;
        const fidelityCardId = formData.get("fidelityCardId") as string;
        const fidelityCard = await fetchDocument<FidelityCard>("cards", fidelityCardId);

        const userCard = {
          userId,
          fidelityCardId,
          createdAt: new Date(),
          points: fidelityCard?.rules.initialCredits || 10,
        };

        const [errors] = await createDocument("userCards", userCard);

        if (errors) {
          return json({
            success: false,
            message: "Error attaching card. Please try again.",
          });
        }

        return json({
          success: true,
          message: "Card attached successfully!",
        });
      }
      case "deleteCard": {
        const userId = formData.get("userId") as string;
        const fidelityCardId = formData.get("fidelityCardId") as string;
        
        // Buscar el userCard correspondiente
        const userCards = await fetchDocuments<UserCard>("userCards", [
          "userId",
          "==",
          userId
        ]);

        const userCard = userCards.find(card => card.fidelityCardId === fidelityCardId);

        if (!userCard) {
          return json({
            success: false,
            message: "No se encontró la tarjeta para eliminar.",
          });
        }

        await deleteDocument("userCards", userCard.id);

        return json({
          success: true,
          message: "Tarjeta eliminada exitosamente!",
        });
      }
      default:
        return json({
          success: false,
          message: "Invalid action",
        });
    }
  } catch (error) {
    console.error("Error handling action:", error);
    return json({
      success: false,
      message: "An error occurred. Please try again.",
    });
  }
};

export default function UserDetail() {
  const { user, userFidelityCards, cards } = useLoaderData<LoaderData>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
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
        setIsDialogOpen(false);
        setIsDeleteDialogOpen(false);
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
    <div className="container mx-auto py-6 space-y-6">
      {/* Back Button */}
      <div>
        <Link
          to="/users"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
        >
          ← Volver
        </Link>
      </div>

      {/* User Profile Section */}
      <Card>
        <CardHeader className="flex flex-row items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.profilePictureUrl} alt={user.name} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{user.name}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant={user.accountStatus === "active" ? "default" : "destructive"}>
                {user.accountStatus === "active" ? "Activo" : user.accountStatus === "newAccount" ? "Nueva Cuenta" : "Inactivo"}
              </Badge>
              <Badge variant="outline">{user.points} Puntos</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Información de Contacto</h3>
            <p className="text-sm text-muted-foreground">
              Teléfono: {user.phoneNumber}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Fidelity Cards Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Tarjetas de Fidelidad</CardTitle>
            <CardDescription>
              Gestionar tarjetas de fidelidad y recompensas del usuario
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Agregar Nueva Tarjeta</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adjuntar Tarjeta de Fidelidad</DialogTitle>
              </DialogHeader>
              <Form method="post" className="space-y-4">
                <input type="hidden" name="action" value="attachCard" />
                <input type="hidden" name="userId" value={user.id} />

                <div className="space-y-2">
                  <Label htmlFor="fidelityCardId">Seleccionar Tarjeta</Label>
                  <Select name="fidelityCardId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar una tarjeta" />
                    </SelectTrigger>
                    <SelectContent>
                      {cards
                        .filter(
                          (card) =>
                            !userFidelityCards.some(
                              (userCard) => userCard.id === card.id
                            )
                        )
                        .map((card) => (
                          <SelectItem key={card.id} value={card.id}>
                            {card.cardTitle}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={navigation.state === "submitting"}
                  >
                    {navigation.state === "submitting"
                      ? "Adjuntando..."
                      : "Adjuntar Tarjeta"}
                  </Button>
                </DialogFooter>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" className="w-full">
            <TabsList>
              <TabsTrigger value="active">Tarjetas Activas</TabsTrigger>
            </TabsList>
            <TabsContent value="active">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userFidelityCards.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center p-8 text-center">
                    <div className="rounded-full bg-muted p-6 mb-4">
                      <CreditCard className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">
                      No hay tarjetas activas
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Este usuario aún no tiene tarjetas de fidelidad activas.
                    </p>
                    <Button onClick={() => setIsDialogOpen(true)}>
                      Agregar Nueva Tarjeta
                    </Button>
                  </div>
                ) : (
                  userFidelityCards.map((card) => (
                    <Card key={card.id} className="overflow-hidden">
                      <div
                        className="h-32 bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${card.cardDesign.backgroundImage})`,
                        }}
                      />
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{card.cardTitle}</h3>
                            <p className="text-sm text-muted-foreground">
                              {card.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge>{card.userPoints} pts</Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => {
                                setSelectedCardId(card.id);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
            <TabsContent value="inactive">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userFidelityCards.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center p-8 text-center">
                    <div className="rounded-full bg-muted p-6 mb-4">
                      <CreditCard className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">
                      No hay tarjetas inactivas
                    </h3>
                    <p className="text-muted-foreground">
                      Este usuario no tiene tarjetas de fidelidad inactivas.
                    </p>
                  </div>
                ) : (
                  userFidelityCards
                    .filter((card) => card.rules.status === "inactive")
                    .map((card) => (
                      <Card
                        key={card.id}
                        className="overflow-hidden opacity-60"
                      >
                        {/* Same card content as active cards */}
                      </Card>
                    ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Tarjeta</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            ¿Está seguro que desea eliminar esta tarjeta? Esta acción no se puede deshacer.
          </p>
          <DialogFooter>
            <Form method="post" className="flex gap-2">
              <input type="hidden" name="action" value="deleteCard" />
              <input type="hidden" name="userId" value={user.id} />
              <input type="hidden" name="fidelityCardId" value={selectedCardId || ""} />
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={navigation.state === "submitting"}
              >
                {navigation.state === "submitting" ? "Eliminando..." : "Eliminar"}
              </Button>
            </Form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Error boundary
export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <div className="container mx-auto py-6">
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
          <CardDescription>
            {error instanceof Error
              ? error.message
              : "Ocurrió un error desconocido"}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
