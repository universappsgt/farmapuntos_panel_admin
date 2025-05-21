import { json, redirect } from "@remix-run/react";

export const loader = async () => {
  await redirect("/users");
  return json({ ok: true });
};

export default function Index() {
  return (
    <div>
      <h1>Welcome to the Basic HTML Page</h1>
      <p>This is a simple HTML structure returned by the Index component.</p>
    </div>
  );
}
