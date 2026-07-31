"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Municipio } from "@/lib/tipos";

/** Remove acentos para que "sao paulo" encontre "São Paulo". */
function normalizar(texto: string) {
    return texto
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase();
}

type Props = {
    municipios: Municipio[];
    valor: string;
    aoEscolher: (nome: string) => void;
    desabilitado?: boolean;
};

/**
 * Um `<select>` nativo com 645 opções (o caso de São Paulo) é impraticável.
 * Aqui a pessoa digita para filtrar, com navegação por teclado e o mesmo
 * comportamento no toque.
 */
export function SeletorMunicipio({ municipios, valor, aoEscolher, desabilitado }: Props) {
    const [aberto, setAberto] = useState(false);
    const [busca, setBusca] = useState("");
    const [destacado, setDestacado] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);
    const listaRef = useRef<HTMLUListElement>(null);
    const idLista = useId();

    const filtrados = useMemo(() => {
        if (!busca.trim()) return municipios;
        const alvo = normalizar(busca);
        return municipios.filter((m) => normalizar(m.nome).includes(alvo));
    }, [municipios, busca]);

    useEffect(() => {
        function aoClicarFora(evento: MouseEvent) {
            if (!containerRef.current?.contains(evento.target as Node)) setAberto(false);
        }
        document.addEventListener("mousedown", aoClicarFora);
        return () => document.removeEventListener("mousedown", aoClicarFora);
    }, []);

    useEffect(() => {
        if (!aberto) return;
        listaRef.current?.querySelector<HTMLElement>(`[data-indice="${destacado}"]`)?.scrollIntoView({
            block: "nearest",
        });
    }, [destacado, aberto]);

    function escolher(nome: string) {
        aoEscolher(nome);
        setBusca("");
        setAberto(false);
    }

    function aoTeclar(evento: React.KeyboardEvent) {
        if (evento.key === "ArrowDown" || evento.key === "ArrowUp") {
            evento.preventDefault();
            if (!aberto) return setAberto(true);
            setDestacado((atual) => {
                const proximo = evento.key === "ArrowDown" ? atual + 1 : atual - 1;
                return Math.max(0, Math.min(filtrados.length - 1, proximo));
            });
        } else if (evento.key === "Enter" && aberto) {
            evento.preventDefault();
            const escolhido = filtrados[destacado];
            if (escolhido) escolher(escolhido.nome);
        } else if (evento.key === "Escape") {
            setAberto(false);
        }
    }

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                role="combobox"
                aria-expanded={aberto}
                aria-controls={idLista}
                aria-label={valor ? `Município: ${valor}` : "Escolher município"}
                disabled={desabilitado}
                onClick={() => {
                    setAberto((a) => !a);
                    setDestacado(0);
                }}
                className="flex w-full items-center justify-between gap-2 rounded-xl border border-borda bg-fundo-2 px-4 py-3 text-left text-texto outline-none focus-visible:border-acento disabled:opacity-50"
            >
                <span className="truncate">{valor || "Carregando…"}</span>
                <ChevronDown className={cn("size-4 shrink-0 text-texto-suave transition", aberto && "rotate-180")} />
            </button>

            {aberto && (
                <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-borda bg-superficie shadow-2xl">
                    <div className="flex items-center gap-2 border-b border-borda px-3">
                        <Search className="size-4 shrink-0 text-texto-suave" />
                        <input
                            autoFocus
                            value={busca}
                            onChange={(e) => {
                                setBusca(e.target.value);
                                setDestacado(0);
                            }}
                            onKeyDown={aoTeclar}
                            placeholder="Buscar município…"
                            aria-label="Buscar município"
                            className="w-full bg-transparent py-2.5 text-sm text-texto outline-none placeholder:text-texto-suave"
                        />
                    </div>

                    <ul ref={listaRef} id={idLista} role="listbox" className="max-h-64 overflow-y-auto py-1">
                        {filtrados.length === 0 && (
                            <li className="px-4 py-3 text-sm text-texto-suave">Nenhum município encontrado.</li>
                        )}

                        {filtrados.map((m, i) => (
                            <li key={m.nome} data-indice={i} role="option" aria-selected={m.nome === valor}>
                                <button
                                    type="button"
                                    onClick={() => escolher(m.nome)}
                                    onMouseEnter={() => setDestacado(i)}
                                    className={cn(
                                        "flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-sm transition",
                                        i === destacado && "bg-acento/10 text-acento",
                                    )}
                                >
                                    <span className="truncate">{m.nome}</span>
                                    {m.nome === valor && <Check className="size-4 shrink-0" />}
                                </button>
                            </li>
                        ))}
                    </ul>

                    <p className="border-t border-borda px-4 py-2 text-xs text-texto-suave">
                        {filtrados.length} de {municipios.length} municípios
                    </p>
                </div>
            )}
        </div>
    );
}
