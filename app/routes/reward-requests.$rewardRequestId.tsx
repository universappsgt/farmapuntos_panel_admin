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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Form } from "@remix-run/react";
import {
  fetchDocument,
  updateDocument,
} from "~/services/firestore.server";
import { RewardRequest, RewardRequestStatus, User, UserCard } from "~/models/types";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface LoaderData {
  rewardRequest: RewardRequest;
}

export const loader: LoaderFunction = async ({ params }) => {
  const rewardRequestId = params.rewardRequestId;
  if (!rewardRequestId) {
    throw new Response("ID de solicitud requerido", { status: 400 });
  }

  const rewardRequest = await fetchDocument<RewardRequest>("rewardRequests", rewardRequestId);
  if (!rewardRequest) {
    throw new Response("Solicitud no encontrada", { status: 404 });
  }

  return json<LoaderData>({ rewardRequest });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("action");

  try {
    switch (action) {
      case "updateStatus": {
        const id = formData.get("id") as string;
        const status = formData.get("status") as RewardRequestStatus;
        const rewardRequest = await fetchDocument<RewardRequest>("rewardRequests", id);

        if (!rewardRequest) {
          throw new Error("Solicitud no encontrada");
        }

        // Actualizar el estado de la solicitud
        await updateDocument<RewardRequest>("rewardRequests", id, {
          status: status,
        });

        // Si el estado es aprobado o denegado
        if (status === RewardRequestStatus.Approved || status === RewardRequestStatus.Rejected) {
          // Obtener la tarjeta del usuario
          const userCard = await fetchDocument<UserCard>("userCards", rewardRequest.card.id);
          if (userCard) {
            // Debitar los puntos
            await updateDocument<UserCard>("userCards", userCard.id, {
              points: userCard.points - rewardRequest.reward.awardedPoints
            });
          }

          // Actualizar el array requestRewards del usuario
          const user = await fetchDocument<User>("users", rewardRequest.user.id);
          console.log(user);
          if (user && user.requestRewards) {
            const updatedRequestRewards = user.requestRewards.filter(
              (requestId: string) => requestId !== rewardRequest.reward.id
            );
            console.log(updatedRequestRewards);
            await updateDocument<User>("users", user.id, {
              requestRewards: updatedRequestRewards
            });
          }
        }

        return json({
          success: true,
          message: "Estado de la solicitud actualizado exitosamente!",
        });
      }
      default:
        return json({
          success: false,
          message: "Acción inválida",
        });
    }
  } catch (error) {
    console.error("Error handling action:", error);
    return json({
      success: false,
      message: "Ocurrió un error. Por favor, intente nuevamente.",
    });
  }
};

export default function RewardRequestDetail() {
  const { rewardRequest } = useLoaderData<LoaderData>();
  const navigation = useNavigation();
  const actionData = useActionData<{ success: boolean; message: string }>();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<RewardRequestStatus | null>(null);

  const isStatusFinal = rewardRequest.status === RewardRequestStatus.Approved || 
                       rewardRequest.status === RewardRequestStatus.Rejected;

  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        toast.success(actionData.message);
        setShowConfirmModal(false);
      } else {
        toast.error(actionData.message);
      }
    }
  }, [actionData]);

  const handleStatusChange = (status: RewardRequestStatus) => {
    setSelectedStatus(status);
    setShowConfirmModal(true);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Estado y encabezado */}
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-bold mt-2">Detalle de Solicitud de Canjeo</h1>

        <Badge
          className={`text-lg px-6 py-2 rounded-full ${
            rewardRequest.status === 'approved'
              ? 'bg-green-100 text-green-700 border-green-400'
              : rewardRequest.status === 'rejected'
              ? 'bg-red-100 text-red-700 border-red-400'
              : 'bg-yellow-100 text-yellow-700 border-yellow-400'
          }`}
        >
          {RewardRequestStatus.getName(rewardRequest.status)}
        </Badge>
      </div>

      {/* Acciones */}
      <div className="flex justify-between items-center mb-4">
        <Link
          to="/reward-requests"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
        >
          ← Volver
        </Link>
        <Form method="post" id="status-form" className="flex items-center gap-4">
          <input type="hidden" name="action" value="updateStatus" />
          <input type="hidden" name="id" value={rewardRequest.id} />
          <input type="hidden" name="status" value={selectedStatus || ''} />
          <Select 
            name="status" 
            defaultValue={rewardRequest.status}
            disabled={isStatusFinal}
            onValueChange={(value) => handleStatusChange(value as RewardRequestStatus)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(RewardRequestStatus).filter((value): value is RewardRequestStatus =>
                typeof value === 'string'
              ).map((status) => (
                <SelectItem key={status} value={status}>
                  <Badge variant={RewardRequestStatus.getVariant(status)}>
                    {RewardRequestStatus.getName(status)}
                  </Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Form>
      </div>

      {/* Modal de confirmación */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar cambio de estado</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas cambiar el estado a {selectedStatus && RewardRequestStatus.getName(selectedStatus)}? 
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="status-form"
              disabled={navigation.state === "submitting"}
            >
              {navigation.state === "submitting" ? "Actualizando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Información principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Usuario */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Usuario</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={rewardRequest.user.profilePictureUrl} alt={rewardRequest.user.name} />
              <AvatarFallback>{rewardRequest.user.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-lg">{rewardRequest.user.name}</p>
              <p className="text-sm text-muted-foreground">{rewardRequest.user.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Recompensa */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recompensa</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="relative w-20 h-20">
              <img
                src={rewardRequest.reward.imageUrl}
                alt={rewardRequest.reward.name}
                className="rounded-full object-cover w-full h-full border"
              />
            </div>
            <div>
              <p className="font-medium text-lg">{rewardRequest.reward.name}</p>
              <p className="text-sm text-muted-foreground">
                Puntos requeridos: <span className="font-semibold">{rewardRequest.reward.awardedPoints}</span>
              </p>
              {rewardRequest.reward.expirationDate && (
                <p className="text-sm text-muted-foreground">
                  Expira: {new Date(rewardRequest.reward.expirationDate).toLocaleDateString()}
                </p>
              )}
              {rewardRequest.reward.stock !== undefined && (
                <p className="text-sm text-muted-foreground">
                  Stock disponible: {rewardRequest.reward.stock}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información de la solicitud */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información de la Solicitud</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Fecha</p>
              <p className="font-medium">{new Date(rewardRequest.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-1">Estado</p>
              <Badge variant={RewardRequestStatus.getVariant(rewardRequest.status)}>
                {RewardRequestStatus.getName(rewardRequest.status)}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-1">ID de Solicitud</p>
              <p className="font-mono text-xs">{rewardRequest.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de puntos */}
      <div className="flex flex-col items-center mt-8">
        <div className="bg-green-100 rounded-2xl px-10 py-6 flex flex-col items-center">
          <span className="text-5xl font-bold text-green-700">
            {rewardRequest.reward.awardedPoints} pts
          </span>
          <span className="text-lg text-green-700 mt-2">Puntos Canjeados</span>
        </div>
      </div>
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