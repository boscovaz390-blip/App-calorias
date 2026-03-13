import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FitPic - Tu Coach de Nutrición con IA",
  description: "Toma una foto de tu comida y descubre sus calorías al instante. Seguimiento inteligente de dieta, actividad física y progreso con IA.",
  keywords: "calorías, nutrición, fitness, IA, dieta, salud, FitPic",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
