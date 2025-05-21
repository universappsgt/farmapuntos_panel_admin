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
  fetchDocuments,
  updateDocument,
} from "~/services/firestore.server";
import { Transaction, TransactionStatus, Product } from "~/models/types";
import { toast } from "sonner";

interface TransactionProduct {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

interface LoaderData {
  transaction: Transaction;
  transactionProducts: TransactionProduct[];
}

export const loader: LoaderFunction = async ({ params }) => {
  const transactionId = params.transactionId;
  if (!transactionId) {
    throw new Response("Transaction ID is required", { status: 400 });
  }

  const transaction = await fetchDocument<Transaction>("transactions", transactionId);
  if (!transaction) {
    throw new Response("Transaction not found", { status: 404 });
  }

  // Fetch transaction products subcollection
  const transactionProducts = await fetchDocuments<TransactionProduct>(
    `transactions/${transactionId}/transactionProducts`
  );

  // Fetch full product details for each transaction product
  const productsWithDetails = await Promise.all(
    transactionProducts.map(async (tp) => {
      const product = await fetchDocument<Product>("products", tp.product.id);
      return {
        ...tp,
        product,
      };
    })
  );


  return json<LoaderData>({ 
    transaction, 
    transactionProducts: productsWithDetails as TransactionProduct[]
  });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("action");

  try {
    switch (action) {
      case "updateStatus": {
        const id = formData.get("id") as string;
        const status = formData.get("status") as TransactionStatus;

        await updateDocument<Transaction>("transactions", id, {
          status: status,
        });

        return json({
          success: true,
          message: "Transaction status updated successfully!",
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

export default function TransactionDetail() {
  const { transaction, transactionProducts } = useLoaderData<LoaderData>();
  const navigation = useNavigation();
  const actionData = useActionData<{ success: boolean; message: string }>();

  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        toast.success(actionData.message);
      } else {
        toast.error(actionData.message);
      }
    }
  }, [actionData]);

  const totalAmount = transactionProducts.reduce(
    (sum, tp) => sum + tp.product.price * tp.quantity,
    0
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Back Button */}
      <div>
        <Link
          to="/transactions"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
        >
          ← Volver
        </Link>
      </div>

      {/* Transaction Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Transacción #{transaction.id}</CardTitle>
            <CardDescription>
              {new Date(transaction.createdAt).toLocaleString()}
            </CardDescription>
          </div>
          <Form method="post" className="flex items-center gap-4">
            <input type="hidden" name="action" value="updateStatus" />
            <input type="hidden" name="id" value={transaction.id} />
            <Select 
              name="status" 
              defaultValue={transaction.status}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(TransactionStatus).filter((value): value is TransactionStatus => 
                  typeof value === 'string'
                ).map((status) => (
                  <SelectItem key={status} value={status}>
                    <Badge variant={TransactionStatus.getVariant(status)}>
                      {TransactionStatus.getName(status)}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              type="submit"
              disabled={navigation.state === "submitting"}
            >
              {navigation.state === "submitting" 
                ? "Updating..." 
                : "Update Status"}
            </Button>
          </Form>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-6">
          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cliente</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage 
                  src={transaction.user.profilePictureUrl} 
                  alt={transaction.user.name} 
                />
                <AvatarFallback>{transaction.user.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{transaction.user.name}</p>
                <p className="text-sm text-muted-foreground">
                  {transaction.user.email}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Agent Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Agente</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage 
                  src={transaction.agent.profilePictureUrl} 
                  alt={transaction.agent.name} 
                />
                <AvatarFallback>{transaction.agent.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{transaction.agent.name}</p>
                <p className="text-sm text-muted-foreground">
                  {transaction.agent.email}
                </p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
          <CardDescription>
            Lista de productos en esta transacción
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactionProducts.map((tp) => (
              <div 
                key={tp.id} 
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{tp.product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Cantidad: {tp.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    Q {(tp.product.price * tp.quantity).toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {tp.product.awardedPoints * tp.quantity} pts
                  </p>
                </div>
              </div>
            ))}
            <div className="flex justify-between pt-4 border-t">
              <p className="font-semibold">Total</p>
              <div className="text-right">
                <p className="font-semibold">Q {totalAmount.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">
                  {transaction.points} pts
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signatures and Evidence */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Firma del Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <img
              src={transaction.userSignatureUrl ?? undefined}
              alt="Client Signature"
              className="w-full h-40 object-contain rounded-md"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Firma del Agente</CardTitle>
          </CardHeader>
          <CardContent>
            <img
              src={transaction.agentSignatureUrl ?? undefined}
              alt="Agent Signature"
              className="w-full h-40 object-contain rounded-md"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Evidencia</CardTitle>
          </CardHeader>
          <CardContent>
            <img
              src={transaction.evidenceImageUrl ?? undefined}
              alt="Evidence"
              className="w-full h-40 object-contain rounded-md"
            />
          </CardContent>
        </Card>
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
              : "An unknown error occurred"}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
} 