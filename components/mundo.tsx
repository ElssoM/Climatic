"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

type CidadeMundo = {
    nome: string;
    pais: string;
    temperatura: number;
    condicao: string;
    horaLocal: string;
    ehDia: boolean;
};

export function Mundo() {
    const [cidades, setCidades] = useState<CidadeMundo[]>([]);
    const [falhou, setFalhou] = useState(false);

    useEffect(() => {
        fetch("/api/mundo")
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then(setCidades)
            .catch(() => setFalhou(true));
    }, []);

    /* Se o painel não carregar, ele simplesmente não aparece — é conteúdo
       complementar e não deve virar uma mensagem de erro na página. */
    if (falhou) return null;

    return (
        <section className="border-t border-borda py-24">
            <div className="container-app">
                <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                            Agora no mundo
                        </h2>
                        <p className="mt-3 text-texto-suave">
                            Temperatura e horário local das principais capitais, atualizados a cada dez minutos.
                        </p>
                    </div>
                    <span className="inline-flex items-center gap-2 text-xs font-medium tracking-wider text-texto-suave uppercase">
                        <span className="relative flex size-2">
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-acento opacity-60" />
                            <span className="relative inline-flex size-2 rounded-full bg-acento" />
                        </span>
                        Ao vivo
                    </span>
                </header>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {cidades.length === 0
                        ? Array.from({ length: 8 }).map((_, i) => (
                              <div key={i} className="vidro h-36 animate-pulse rounded-2xl" />
                          ))
                        : cidades.map((cidade, i) => (
                              <motion.article
                                  key={cidade.nome}
                                  initial={{ opacity: 0, y: 20 }}
                                  whileInView={{ opacity: 1, y: 0 }}
                                  viewport={{ once: true, margin: "-60px" }}
                                  transition={{ delay: i * 0.05, duration: 0.45 }}
                                  className="vidro group relative overflow-hidden rounded-2xl p-5 transition hover:border-acento/40"
                              >
                                  <div
                                      className={cn(
                                          "absolute -top-12 -right-12 size-32 rounded-full blur-2xl transition group-hover:opacity-90",
                                          cidade.ehDia ? "bg-amber-400/15" : "bg-indigo-400/15",
                                      )}
                                  />

                                  <div className="relative flex items-start justify-between gap-3">
                                      <div className="min-w-0">
                                          <h3 className="truncate font-semibold">{cidade.nome}</h3>
                                          <p className="truncate text-xs text-texto-suave">{cidade.pais}</p>
                                      </div>
                                      {cidade.ehDia ? (
                                          <Sun className="size-4 shrink-0 text-amber-400" aria-label="dia" />
                                      ) : (
                                          <Moon className="size-4 shrink-0 text-indigo-300" aria-label="noite" />
                                      )}
                                  </div>

                                  <p className="relative mt-4 font-display text-4xl font-semibold tracking-tight tabular-nums">
                                      {cidade.temperatura}°
                                  </p>

                                  <div className="relative mt-2 flex items-center justify-between gap-2 text-sm">
                                      <span className="truncate text-texto-suave">{cidade.condicao}</span>
                                      <span className="shrink-0 font-mono text-xs text-texto-suave tabular-nums">
                                          {cidade.horaLocal}
                                      </span>
                                  </div>
                              </motion.article>
                          ))}
                </div>
            </div>
        </section>
    );
}
