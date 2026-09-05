import { createFileRoute } from "@tanstack/react-router";
import { Copilot } from "./copilot";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [{ title: "ScholarMatch Copilot | ScholarMatch AI" }],
  }),
  component: Copilot,
});
