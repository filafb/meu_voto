import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Meu Voto 2026 — para onde vai seu voto",
  description:
    "Descubra a federação partidária da sua candidata/o a deputada/o federal ou estadual em 2026, e todas/os as/os outras/os candidatas/os dessa federação no seu estado.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${spaceGrotesk.variable} ${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-paper text-ink font-body antialiased">
        {children}
      </body>
    </html>
  );
}
