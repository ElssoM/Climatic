import { Hero } from "@/components/hero";
import { Mundo } from "@/components/mundo";
import { PainelRelatorio } from "@/components/painel-relatorio";
import { Recursos } from "@/components/recursos";

export default function Home() {
  return (
    <main>
      <Hero />
      <PainelRelatorio />
      <Mundo />
      <Recursos />

      <footer className="border-t border-borda py-10">
        <div className="container-app flex flex-wrap items-center justify-between gap-4 text-sm text-texto-suave">
          <p>
            Dados de{" "}
            <a
              href="https://servicodados.ibge.gov.br/api/docs/localidades"
              target="_blank"
              rel="noopener"
              className="text-acento hover:underline"
            >
              IBGE
            </a>{" "}
            e{" "}
            <a
              href="https://www.weatherapi.com/"
              target="_blank"
              rel="noopener"
              className="text-acento hover:underline"
            >
              WeatherAPI
            </a>
            .
          </p>
          <p>Climatic</p>
        </div>
      </footer>
    </main>
  );
}
