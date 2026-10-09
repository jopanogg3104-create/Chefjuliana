import type { Metadata } from "next";
import Landing from "@/components/landing/Landing";
export const metadata: Metadata = { alternates: { canonical: "/" } };
const business = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Chef Juliana Nogueira",
  url: "https://chefjuliananogueira.com.br",
  telephone: "+5514997563799",
  image: "https://chefjuliananogueira.com.br/media/juliana.webp",
  description:
    "Chef domiciliar, gastronomia para eventos e tábuas gastronômicas.",
  sameAs: ["https://www.instagram.com/chef.juliananogueira/"],
};
export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(business).replace(/</g, "\\u003c"),
        }}
      />
      <Landing />
    </>
  );
}
