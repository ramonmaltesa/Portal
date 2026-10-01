import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portal de oportunidades laborales",
  description: "Ofertas laborales de Chilquinta, Esval, Aguas del Valle y USM, reunidas en un solo lugar.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
