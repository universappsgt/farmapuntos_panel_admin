import { Checkbox } from "@radix-ui/react-checkbox";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { ColumnDef } from "@tanstack/react-table";
import {
  FidelityCard,
  Laboratory,
  Survey,
  User,
  Transaction,
  TransactionStatus,
  Reward,
  Product,
  Pharmacy,
} from "~/models/types";
import { Button } from "../ui/button";
import { Form, Link } from "@remix-run/react";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

export const laboratoryColumns = ({
  editAction,
  navigation,
}: {
  editAction: (id: string) => void;
  navigation: { state: string; formData?: FormData };
}): ColumnDef<Laboratory>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "location",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Location
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="lowercase">{row.getValue("location")}</div>
    ),
  },
  {
    accessorKey: "specialization",
    header: "Especialidad",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("specialization")}</div>
    ),
  },
  {
    accessorKey: "contactNumber",
    header: "Contacto",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("contactNumber")}</div>
    ),
  },
  {
    header: "Acciones",
    id: "actions",
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <Form method="post" style={{ display: "inline" }}>
          <input type="hidden" name="action" value="edit" />
          <input type="hidden" name="id" value={row.original.id} />
          <Button
            type="submit"
            onClick={() => editAction(row.original.id)}
            variant="secondary"
            disabled={navigation.state === "submitting"}
          >
            Editar
          </Button>
        </Form>
        <Form method="post" style={{ display: "inline" }}>
          <input type="hidden" name="action" value="delete" />
          <input type="hidden" name="id" value={row.original.id} />
          <Button
            type="submit"
            variant="destructive"
            disabled={navigation.state === "submitting"}
          >
            {navigation.state === "submitting" &&
            navigation.formData?.get("id") === row.original.id
              ? "Eliminando..."
              : `Eliminar`}
          </Button>
        </Form>
      </div>
    ),
  },
];

export const fidelityCardColumns = ({
  editAction,
  navigation,
}: {
  editAction: (id: string) => void;
  navigation: { state: string; formData?: FormData };
}): ColumnDef<FidelityCard>[] => [
  {
    accessorKey: "cardTitle",
    header: "Card Title",
    cell: ({ row }) => <div>{row.original.cardTitle}</div>,
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => <div>{row.original.description}</div>,
  },
  {
    accessorKey: "contact.phoneNumber",
    header: "Phone Number",
    cell: ({ row }) => <div>{row.original.contact.phoneNumber}</div>,
  },
  {
    accessorKey: "contact.website",
    header: "Website",
    cell: ({ row }) => <div>{row.original.contact.website}</div>,
  },
  {
    accessorKey: "rules.currency",
    header: "Currency",
    cell: ({ row }) => <div>{row.original.rules.currency}</div>,
  },
  {
    accessorKey: "rules.forPurchasePrice",
    header: "Purchase Price",
    cell: ({ row }) => <div>{row.original.rules.forPurchasePrice}</div>,
  },
  {
    accessorKey: "rules.initialCredits",
    header: "Initial Credits",
    cell: ({ row }) => <div>{row.original.rules.initialCredits}</div>,
  },
  {
    accessorKey: "rules.status",
    header: "Status",
    cell: ({ row }) => <div>{row.original.rules.status}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <Form method="post" style={{ display: "inline" }}>
          <input type="hidden" name="action" value="edit" />
          <input type="hidden" name="id" value={row.original.id} />
          <Button
            type="submit"
            onClick={() => editAction(row.original.id)}
            variant="secondary"
            disabled={navigation.state === "submitting"}
          >
            Edit
          </Button>
        </Form>
        <Form method="post" style={{ display: "inline" }}>
          <input type="hidden" name="action" value="delete" />
          <input type="hidden" name="id" value={row.original.id} />
          <Button
            type="submit"
            variant="destructive"
            disabled={navigation.state === "submitting"}
          >
            {navigation.state === "submitting" &&
            navigation.formData?.get("id") === row.original.id
              ? "Deleting..."
              : "Delete"}
          </Button>
        </Form>
      </div>
    ),
  },
];

export const surveyColumns = ({
  editAction,
  navigation,
}: {
  editAction: (id: string) => void;
  navigation: { state: string; formData?: FormData };
}): ColumnDef<Survey>[] => [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Título
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("title")}</div>
    ),
  },
  {
    accessorKey: "description",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Descripción
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("description")}</div>,
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Estado
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as
        | "active"
        | "inactive"
        | "completed";
      const variant =
        status === "active"
          ? "default"
          : status === "inactive"
          ? "secondary"
          : "outline";
      return (
        <Badge variant={variant} className="capitalize">
          {status === "active"
            ? "Activo"
            : status === "inactive"
            ? "Inactivo"
            : "Completado"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "deadline",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha Límite
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div>{new Date(row.getValue("deadline")).toLocaleString()}</div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha Creación
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div>{new Date(row.getValue("createdAt")).toLocaleString()}</div>
    ),
  },
  {
    accessorKey: "awardedPoints",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Puntos
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("awardedPoints")}</div>,
  },
  {
    accessorKey: "videoUrl",
    header: "Video",
    cell: ({ row }) => {
      const videoUrl = row.getValue("videoUrl") as string;
      return videoUrl ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(videoUrl, "_blank")}
        >
          Ver Video
        </Button>
      ) : (
        <div>No disponible</div>
      );
    },
  },
  {
    header: "Acciones",
    id: "actions",
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <Form method="post" style={{ display: "inline" }}>
          <input type="hidden" name="action" value="edit" />
          <input type="hidden" name="id" value={row.original.id} />
          <Button
            type="submit"
            onClick={() => editAction(row.original.id)}
            variant="secondary"
            disabled={navigation.state === "submitting"}
          >
            Editar
          </Button>
        </Form>
        <Form method="post" style={{ display: "inline" }}>
          <input type="hidden" name="action" value="delete" />
          <input type="hidden" name="id" value={row.original.id} />
          <Button
            type="submit"
            variant="destructive"
            disabled={navigation.state === "submitting"}
          >
            {navigation.state === "submitting" &&
            navigation.formData?.get("id") === row.original.id
              ? "Eliminando..."
              : "Eliminar"}
          </Button>
        </Form>
      </div>
    ),
  },
];

export const agentColumns = ({
  editAction,
  navigation,
}: {
  editAction: (id: string) => void;
  navigation: { state: string; formData?: FormData };
}): ColumnDef<User>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div>{row.getValue("email")}</div>,
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone Number",
    cell: ({ row }) => <div>{row.getValue("phoneNumber")}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <Form method="post" style={{ display: "inline" }}>
          <input type="hidden" name="action" value="edit" />
          <input type="hidden" name="id" value={row.original.id} />
          <Button
            type="submit"
            onClick={() => editAction(row.original.id)}
            variant="secondary"
            disabled={navigation.state === "submitting"}
          >
            Edit
          </Button>
        </Form>
        <Form method="post" style={{ display: "inline" }}>
          <input type="hidden" name="action" value="delete" />
          <input type="hidden" name="id" value={row.original.id} />
          <Button
            type="submit"
            variant="destructive"
            disabled={navigation.state === "submitting"}
          >
            {navigation.state === "submitting" &&
            navigation.formData?.get("id") === row.original.id
              ? "Deleting..."
              : "Delete"}
          </Button>
        </Form>
      </div>
    ),
  },
];

export const userColumns = ({
  editAction,
  navigation,
}: {
  editAction: (id: string) => void;
  navigation: { state: string; formData?: FormData };
}): ColumnDef<User>[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "email",
    header: "Correo",
    cell: ({ row }) => <div>{row.getValue("email")}</div>,
  },
  {
    accessorKey: "phoneNumber",
    header: "Teléfono",
    cell: ({ row }) => <div>{row.getValue("phoneNumber")}</div>,
  },
  {
    accessorKey: "points",
    header: "Puntos",
    cell: ({ row }) => <div>{row.getValue("points")}</div>,
  },
  {
    accessorKey: "accountStatus",
    header: "Estado de Cuenta",
    cell: ({ row }) => {
      const accountStatus = row.getValue("accountStatus");
      let variant = "secondary";
      let text = "Inactivo";

      if (accountStatus === "active") {
        variant = "default";
        text = "Activo";
      } else if (accountStatus === "newAccount") {
        variant = "se";
        text = "Nueva Cuenta";
      }

      return (
        <Badge variant={variant as "default" | "secondary" | "destructive" | "outline"}>
          {text}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <div className="flex items-center gap-2">
          <Link
            to={`/users/${user.id}`}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
          >
            Ver
          </Link>

          <Form method="post" className="flex items-center gap-2">
            <input type="hidden" name="action" value="edit" />
            <input type="hidden" name="id" value={user.id} />
            <Button
              type="submit"
              onClick={() => editAction(user.id)}
              variant="secondary"
              size="sm"
              disabled={navigation.state === "submitting"}
            >
              Edit
            </Button>
          </Form>

          <Form method="post" className="flex items-center">
            <input type="hidden" name="action" value="delete" />
            <input type="hidden" name="id" value={user.id} />
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              disabled={navigation.state === "submitting"}
            >
              {navigation.state === "submitting" &&
              navigation.formData?.get("id") === user.id
                ? "Deleting..."
                : "Delete"}
            </Button>
          </Form>
        </div>
      );
    },
  },
];

export const transactionColumns = ({
  editAction,
  navigation,
}: {
  editAction: (id: string) => void;
  navigation: { state: string; formData?: FormData };
}): ColumnDef<Transaction>[] => [
  {
    accessorKey: "createdAt",
    header: "Fecha de Creación",
    cell: ({ row }) => (
      <div>{new Date(row.getValue("createdAt")).toLocaleString()}</div>
    ),
  },
  {
    accessorKey: "user.name",
    header: "Cliente",
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        <Avatar className="w-8 h-8">
          <AvatarImage
            src={row.original.user.profilePictureUrl}
            alt={row.original.user.name}
          />
          <AvatarFallback>{row.original.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <span>{row.original.user.name}</span>
      </div>
    ),
  },
  {
    accessorKey: "agent.name",
    header: "Agente",
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        <Avatar className="w-8 h-8">
          <AvatarImage
            src={row.original.agent.profilePictureUrl}
            alt={row.original.agent.name}
          />
          <AvatarFallback>{row.original.agent.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <span>{row.original.agent.name}</span>
      </div>
    ),
  },
  {
    accessorKey: "rewardPoins",
    header: "Puntos de Recompensa",
  },
  {
    accessorKey: "transactionStatus",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("transactionStatus") as TransactionStatus;
      const variant = getStatusVariant(status);
      return (
        <Badge variant={variant} className="capitalize">
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "transactionType",
    header: "Tipo",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("transactionType")}</div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <Form method="post" style={{ display: "inline" }}>
          <input type="hidden" name="action" value="edit" />
          <input type="hidden" name="id" value={row.original.id} />
          <Button
            type="submit"
            onClick={() => editAction(row.original.id)}
            variant="secondary"
            disabled={navigation.state === "submitting"}
          >
            Editar
          </Button>
        </Form>
        <Form method="post" style={{ display: "inline" }}>
          <input type="hidden" name="action" value="delete" />
          <input type="hidden" name="id" value={row.original.id} />
          <Button
            type="submit"
            variant="destructive"
            disabled={navigation.state === "submitting"}
          >
            {navigation.state === "submitting" &&
            navigation.formData?.get("id") === row.original.id
              ? "Eliminando..."
              : "Eliminar"}
          </Button>
        </Form>
      </div>
    ),
  },
];

function getStatusVariant(status: TransactionStatus) {
  switch (status) {
    case TransactionStatus.InProgress:
      return "secondary";
    case TransactionStatus.Approved:
      return "default";
    case TransactionStatus.Denied:
      return "destructive";
    default:
      return "outline";
  }
}

export const rewardColumns = ({
  editAction,
  navigation,
}: {
  editAction: (id: string) => void;
  navigation: { state: string; formData?: FormData };
}): ColumnDef<Reward>[] => [
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "imageUrl",
    header: "Imagen",
    cell: ({ row }) => (
      <div className="relative w-10 h-10">
        <img
          src={row.original.imageUrl}
          alt={row.original.name}
          className="rounded-full object-cover w-full h-full"
        />
      </div>
    ),
  },
  {
    accessorKey: "awardedPoints",
    header: "Puntos Requeridos",
  },
  {
    accessorKey: "stock",
    header: "Existencias",
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <Form method="post" style={{ display: "inline" }}>
          <input type="hidden" name="action" value="edit" />
          <input type="hidden" name="id" value={row.original.id} />
          <Button
            type="submit"
            onClick={() => editAction(row.original.id)}
            variant="secondary"
            disabled={navigation.state === "submitting"}
          >
            Editar
          </Button>
        </Form>
        <Form method="post" style={{ display: "inline" }}>
          <input type="hidden" name="action" value="delete" />
          <input type="hidden" name="id" value={row.original.id} />
          <Button
            type="submit"
            variant="destructive"
            disabled={navigation.state === "submitting"}
          >
            {navigation.state === "submitting" &&
            navigation.formData?.get("id") === row.original.id
              ? "Eliminando..."
              : "Eliminar"}
          </Button>
        </Form>
      </div>
    ),
  },
];

export const productColumns = ({
  editAction,
  navigation,
}: {
  editAction: (id: string) => void;
  navigation: { state: string; formData?: FormData };
}): ColumnDef<Product>[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "price",
    header: "Precio",
    cell: ({ row }) => <div>${row.getValue("price")}</div>,
  },
  {
    accessorKey: "awardedPoints",
    header: "Puntos",
    cell: ({ row }) => <div>{row.getValue("awardedPoints")}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <Form method="post" style={{ display: "inline" }}>
          <input type="hidden" name="action" value="edit" />
          <input type="hidden" name="id" value={row.original.id} />
          <Button
            type="submit"
            onClick={() => editAction(row.original.id)}
            variant="secondary"
            disabled={navigation.state === "submitting"}
          >
            Editar
          </Button>
        </Form>
        <Form method="post" style={{ display: "inline" }}>
          <input type="hidden" name="action" value="delete" />
          <input type="hidden" name="id" value={row.original.id} />
          <Button
            type="submit"
            variant="destructive"
            disabled={navigation.state === "submitting"}
          >
            {navigation.state === "submitting" &&
            navigation.formData?.get("id") === row.original.id
              ? "Eliminando..."
              : "Eliminar"}
          </Button>
        </Form>
      </div>
    ),
  },
];

export const pharmacyColumns = ({
  editAction,
  navigation,
}: {
  editAction: (id: string) => void;
  navigation: { state: string; formData?: FormData };
}): ColumnDef<Pharmacy>[] => [
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "address",
    header: "Dirección",
  },
  {
    accessorKey: "phoneNumber",
    header: "Teléfono",
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <Form method="post" style={{ display: "inline" }}>
          <input type="hidden" name="action" value="edit" />
          <input type="hidden" name="id" value={row.original.id} />
          <Button
            type="submit"
            onClick={() => editAction(row.original.id)}
            variant="secondary"
            disabled={navigation.state === "submitting"}
          >
            Editar
          </Button>
        </Form>
        <Form method="post" style={{ display: "inline" }}>
          <input type="hidden" name="action" value="delete" />
          <input type="hidden" name="id" value={row.original.id} />
          <Button
            type="submit"
            variant="destructive"
            disabled={navigation.state === "submitting"}
          >
            {navigation.state === "submitting" &&
            navigation.formData?.get("id") === row.original.id
              ? "Eliminando..."
              : "Eliminar"}
          </Button>
        </Form>
      </div>
    ),
  },
];
