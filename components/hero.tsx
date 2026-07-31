"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ArrowDown } from "lucide-react";
import { useCena3dPermitida } from "./usar-dispositivo";

/* A cena 3D só entra no bundle quando o dispositivo aguenta. */
const Cena3d = dynamic(() => import("./cena-3d"), { ssr: false });

export function Hero() {
    const cena3dPermitida = useCena3dPermitida();
    const titulo = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        if (!titulo.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const palavras = titulo.current.querySelectorAll("[data-palavra]");
        const animacao = gsap.from(palavras, {
            yPercent: 120,
            opacity: 0,
            duration: 1,
            ease: "power4.out",
            stagger: 0.08,
        });

        return () => {
            animacao.kill();
        };
    }, []);

    return (
        <section className="relative flex min-h-[92svh] items-center overflow-hidden">
            <div className="absolute inset-0 -z-10">
                {cena3dPermitida ? (
                    <Cena3d />
                ) : (
                    /* Fallback do mobile: mesmo clima visual, custo de um gradiente. */
                    <div className="h-full w-full bg-[radial-gradient(circle_at_70%_35%,rgba(56,189,248,.22),transparent_55%),radial-gradient(circle_at_25%_75%,rgba(129,140,248,.18),transparent_55%)]" />
                )}
            </div>

            <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-fundo" />

            <div className="container-app">
                <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.6 }}
                    className="mb-5 inline-flex items-center gap-2 rounded-full border border-borda vidro px-4 py-1.5 text-xs font-medium tracking-wide text-texto-suave uppercase"
                >
                    <span className="size-1.5 rounded-full bg-acento" />
                    Dados do IBGE e da WeatherAPI
                </motion.p>

                <h1
                    ref={titulo}
                    className="max-w-4xl text-5xl leading-[1.05] font-semibold tracking-tight sm:text-6xl lg:text-7xl"
                >
                    {["O clima de", "qualquer cidade", "do Brasil."].map((linha) => (
                        <span key={linha} className="block overflow-hidden">
                            <span data-palavra className="block texto-gradiente">
                                {linha}
                            </span>
                        </span>
                    ))}
                </h1>

                <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.7 }}
                    className="mt-7 max-w-xl text-lg text-texto-suave"
                >
                    Previsão hora a hora, qualidade do ar detalhada por poluente e relatório
                    em PDF pronto para entregar — em todos os 5.570 municípios.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65, duration: 0.7 }}
                    className="mt-10 flex flex-wrap items-center gap-4"
                >
                    <a
                        href="#relatorio"
                        className="rounded-full bg-acento px-7 py-3.5 font-semibold text-fundo transition hover:bg-acento/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento"
                    >
                        Gerar relatório
                    </a>
                    <a
                        href="#recursos"
                        className="inline-flex items-center gap-2 rounded-full border border-borda px-7 py-3.5 font-medium text-texto-suave transition hover:border-acento hover:text-texto"
                    >
                        Ver recursos
                        <ArrowDown className="size-4" />
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
