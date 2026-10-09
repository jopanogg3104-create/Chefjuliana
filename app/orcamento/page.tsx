import type { Metadata } from "next";
import Landing from "@/components/landing/Landing";
export const metadata: Metadata = {
  title: "Planeje seu encontro",
  alternates: { canonical: "/orcamento" },
};
export default function Page() {
  return <Landing initialQuote />;
}
