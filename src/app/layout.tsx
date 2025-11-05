
import type { Metadata, Viewport } from "next";
import "./../styles/globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AuthProvider } from "@/components/auth-provider";
import AuthToast from "@/components/auth-toast";

export const metadata: Metadata = {
  metadataBase: new URL("https://pedagopass.example"),
  title: { default: "PedagoPass — Viagens educacionais para professores", template: "%s | PedagoPass" },
  description: "Rede social e vitrine de pacotes educacionais para professores — comunidades, destinos e reservas.",
  icons: { icon: "/favicon.svg" },
  openGraph: { title: "PedagoPass", description: "Conecte-se com professores viajantes e descubra destinos educativos.", url: "https://pedagopass.example", siteName: "PedagoPass", images: [{ url: "/images/recife.jpg", width: 1200, height: 630 }], locale: "pt_BR", type: "website" }
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#007BFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1727" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <AuthProvider>
          <Navbar />
          <main className="pt-16">{children}</main>
          <Footer />
          <AuthToast />
        </AuthProvider>
      </body>
    </html>
  );
}
