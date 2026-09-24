import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono } from "next/font/google";
import { FinalCta, LandingFooter } from "@/components/landing/Closing";
import { Faq } from "@/components/landing/Faq";
import { Features } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import { LandingNav } from "@/components/landing/LandingNav";
import { Pricing } from "@/components/landing/Pricing";
import { Privacy } from "@/components/landing/Privacy";

const display = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"] });
const mono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: { absolute: "RindeMás · Haz que la despensa y la quincena te rindan más" },
  description:
    "Anota tus compras en segundos, mira cuánto te queda para la semana, sigue la inflación del súper y organiza tandas y préstamos. Gratis y sin crear cuenta.",
  alternates: { canonical: "/" },
};

export default function LandingPage() {
  return (
    <div className={`${display.variable} ${mono.variable} min-h-dvh bg-white text-slate-900`}>
      <LandingNav />
      <main>
        <Hero />
        <Features />
        <Privacy />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
