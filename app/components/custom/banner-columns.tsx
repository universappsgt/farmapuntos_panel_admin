import { ColumnDef } from "@tanstack/react-table";
import { Banner } from "~/models/types";
import { Button } from "~/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useNavigation } from "@remix-run/react";

interface BannerColumnsProps {
  editAction: (id: string) => void;
  navigation: ReturnType<typeof useNavigation>;
}

export const bannerColumns = ({
  editAction,
  navigation,
}: BannerColumnsProps): ColumnDef<Banner>[] => [

  {
    accessorKey: "img",
    header: "Imagen",
    cell: ({ row }) => (
      <img
        src={row.original.img}
        alt="Banner"
        className="w-80 h-30 object-cover rounded"
      />
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const isSubmitting = navigation.state === "submitting";
      return (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editAction(row.original.id)}
            disabled={isSubmitting}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={isSubmitting}
            form="delete-form"
            name="id"
            value={row.original.id}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      );
    },
  },
]; 