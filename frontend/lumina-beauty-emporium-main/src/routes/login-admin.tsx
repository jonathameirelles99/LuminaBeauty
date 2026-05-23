import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/login-admin")({
  beforeLoad: () => {
    throw redirect({ to: "/login" });
  },
  component: () => null,
});