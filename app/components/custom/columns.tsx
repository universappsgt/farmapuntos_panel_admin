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
  TransactionType,
  Reward,
} from "~/models/types";
import { Button } from "../ui/button";
import { Form } from "@remix-run/react";

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
    accessorKey: "title",
    header: "Título",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("title")}</div>
    ),
  },
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("description")}</div>
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
    accessorKey: "points",
    header: "Points",
    cell: ({ row }) => <div>{row.getValue("points")}</div>,
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

export const transactionColumns = ({
  editAction,
  navigation,
}: {
  editAction: (id: string) => void;
  navigation: { state: string; formData?: FormData };
}): ColumnDef<Transaction>[] => [
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => (
      <div>{new Date(row.getValue("createdAt")).toLocaleString()}</div>
    ),
  },
  {
    accessorKey: "userId",
    header: "User ID",
  },
  {
    accessorKey: "agentId",
    header: "Agent ID",
  },
  {
    accessorKey: "rewardPoints",
    header: "Reward Points",
  },
  {
    accessorKey: "transactionStatus",
    header: "Status",
    cell: ({ row }) => (
      <div
        className={`capitalize ${getStatusColor(
          row.getValue("transactionStatus")
        )}`}
      >
        {row.getValue("transactionStatus")}
      </div>
    ),
  },
  {
    accessorKey: "transactionType",
    header: "Type",
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

function getStatusColor(status: TransactionStatus) {
  switch (status) {
    case TransactionStatus.InProgress:
      return "text-yellow-600";
    case TransactionStatus.Approved:
      return "text-green-600";
    case TransactionStatus.Denied:
      return "text-red-600";
    default:
      return "";
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
    header: "Name",
  },
  {
    accessorKey: "imageUrl",
    header: "Image",
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
    accessorKey: "expirationDate",
    header: "Expiration Date",
    cell: ({ row }) =>
      new Date(row.original.expirationDate).toLocaleDateString(),
  },
  {
    accessorKey: "worthPoints",
    header: "Worth Points",
  },
  {
    accessorKey: "stock",
    header: "Stock",
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
