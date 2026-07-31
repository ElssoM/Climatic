import type { Metadata } from "next";
import { Inter, Sora, JetBrains_Mono } from "next/font/google";
import { RolagemSuave } from "@/components/rolagem-suave";
import "./globals.css";

/* Sora nos títulos: geométrica, com personalidade nos tamanhos grandes. */
const sora = Sora({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

/* Inter no texto corrido: desenhada para leitura em tela, com ótimo
   comportamento em tamanhos pequenos. */
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

/* JetBrains Mono só nos números: largura fixa mantém as colunas da tabela
   alinhadas de uma linha para a outra. */
const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Climatic — relatório climático por município",
  description:
    "Previsão hora a hora, qualidade do ar por poluente e relatório em PDF para qualquer município brasileiro. Dados do IBGE e da WeatherAPI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${sora.variable} ${inter.variable} ${jetbrains.variable} antialiased`}
      >
        <RolagemSuave />
        {children}
      </body>
    </html>
  );
}
