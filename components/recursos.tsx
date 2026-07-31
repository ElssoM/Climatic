"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Clock, FileText, MapPinned, Wind } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const RECURSOS = [
    {
        icone: MapPinned,
        titulo: "Todo o Brasil",
        texto: "Os 5.570 municípios, do maior ao menor distrito. A lista vem da base oficial do IBGE.",
    },
    {
        icone: Clock,
        titulo: "24 horas detalhadas",
        texto: "Condição do tempo, chance de chuva, temperatura, sensação térmica, umidade e vento a cada hora do dia.",
    },
    {
        icone: Wind,
        titulo: "Qualidade do ar",
        texto: "Índice classificado de Baixa a Muito alta, com a concentração dos seis principais poluentes.",
    },
    {
        icone: FileText,
        titulo: "Relatório em PDF",
        texto: "Um clique gera o documento com todos os dados em texto — pronto para anexar, imprimir ou entregar.",
    },
];

export function Recursos() {
    const secao = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!secao.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const contexto = gsap.context(() => {
            gsap.from("[data-cartao]", {
                y: 48,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out",
                stagger: 0.12,
                scrollTrigger: {
                    trigger: secao.current,
                    start: "top 75%",
                },
            });
        }, secao);

        return () => contexto.revert();
    }, []);

    return (
        <section id="recursos" ref={secao} className="container-app scroll-mt-24 border-t border-borda py-24">
            <header className="mb-12 max-w-2xl">
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">O que você recebe</h2>
                <p className="mt-3 text-texto-suave">
                    Tudo que entra no relatório, em uma consulta só.
                </p>
            </header>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {RECURSOS.map(({ icone: Icone, titulo, texto }) => (
                    <article key={titulo} data-cartao className="vidro rounded-2xl p-6">
                        <span className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-acento/10 text-acento">
                            <Icone className="size-5" />
                        </span>
                        <h3 className="text-lg font-semibold">{titulo}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-texto-suave">{texto}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}
