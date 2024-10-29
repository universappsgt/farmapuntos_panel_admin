import { useState } from "react";
import {
  useLoaderData,
  json,
  useParams,
  useRouteError,
  Link,
} from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { fetchDocument, fetchDocuments } from "~/services/firestore.server";
import type { User, FidelityCard, UserCard } from "~/models/types";
import { FidelityCardForm } from "~/lib/features/wallet/fidelity-card-form";
import { CreditCard } from "lucide-react";

interface LoaderData {
  user: User;
  userFidelityCards: FidelityCard[];
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

  const userFidelityCards = fidelityCards.filter((fidelityCard) =>
    userCards.some((userCard) => userCard.fidelityCardId === fidelityCard.id)
  );

  console.log(userFidelityCards);

  if (!user) {
    throw new Response("User not found", { status: 404 });
  }

  return json<LoaderData>({ user, userFidelityCards });
};

export default function UserDetail() {
  const { user, userFidelityCards } = useLoaderData<LoaderData>();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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
              <Badge variant={user.isEnabled ? "default" : "destructive"}>
                {user.isEnabled ? "Activo" : "Desactivado"}
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
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button>Agregar Nueva Tarjeta</Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[400px]">
              <SheetHeader>
                <SheetTitle>Adjuntar Tarjeta de Fidelidad</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <FidelityCardForm
                  isSheetOpen={isSheetOpen}
                  setIsSheetOpen={setIsSheetOpen}
                  fidelityCardToEdit={undefined}
                  isCreating={true}
                  setIsCreating={() => {}}
                  editingId={null}
                  setEditingId={() => {}}
                />
              </div>
            </SheetContent>
          </Sheet>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" className="w-full">
            <TabsList>
              <TabsTrigger value="active">Tarjetas Activas</TabsTrigger>
              <TabsTrigger value="inactive">Tarjetas Inactivas</TabsTrigger>
            </TabsList>
            <TabsContent value="active">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userFidelityCards.filter(
                  (card) => card.rules.status === "active"
                ).length === 0 ? (
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
                    <Button onClick={() => setIsSheetOpen(true)}>
                      Agregar Nueva Tarjeta
                    </Button>
                  </div>
                ) : (
                  userFidelityCards
                    .filter((card) => card.rules.status === "active")
                    .map((card) => (
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
                              <h3 className="font-semibold">
                                {card.cardTitle}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {card.description}
                              </p>
                            </div>
                            <Badge>{card.rules.rewardPoints} pts</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                )}
              </div>
            </TabsContent>
            <TabsContent value="inactive">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userFidelityCards.filter(
                  (card) => card.rules.status === "inactive"
                ).length === 0 ? (
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
