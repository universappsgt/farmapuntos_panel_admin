import { Checkbox } from "@radix-ui/react-checkbox";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { ColumnDef } from "@tanstack/react-table";
import { FidelityCard, Laboratory, Survey } from "~/models/types";
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
