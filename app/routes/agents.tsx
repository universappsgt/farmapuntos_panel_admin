import { useState } from "react";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

interface Agent {
  id: string;
  name: string;
  email: string;
  profilePicture: string;
}

export const loader: LoaderFunction = async () => {
  // Fetch agents data from your API or database
  // This is a mock implementation
  const agents: Agent[] = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      profilePicture: "https://example.com/john.jpg",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      profilePicture: "https://example.com/jane.jpg",
    },
    // Add more agents as needed
  ];

  return { agents };
};

export default function Agents() {
  const { agents } = useLoaderData<{ agents: Agent[] }>();

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold">Agentes</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Profile</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map((agent) => (
            <TableRow key={agent.id}>
              <TableCell>
                <Avatar>
                  <AvatarImage src={agent.profilePicture} alt={agent.name} />
                  <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>{agent.name}</TableCell>
              <TableCell>{agent.email}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
