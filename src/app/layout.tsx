import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "POÉSIE-MR — Bibliothèque de Poésie Mauritanienne",
  description: "Plateforme de bibliothèque numérique de poésie mauritanienne (français, arabe, hassanya).",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
