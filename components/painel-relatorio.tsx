"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Download, Link2, Loader2, TriangleAlert } from "lucide-react";
import { CORES_AR } from "@/lib/ar";
import { cn } from "@/lib/utils";
import { exportarPdf } from "@/lib/pdf";
import { SeletorMunicipio } from "./seletor-municipio";
import type { Estado, Municipio, Previsao } from "@/lib/tipos";

export function PainelRelatorio() {
    const [estados, setEstados] = useState<Estado[]>([]);
    const [municipios, setMunicipios] = useState<Municipio[]>([]);
    const [uf, setUf] = useState("");
    const [cidade, setCidade] = useState("");
    const [previsao, setPrevisao] = useState<Previsao | null>(null);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    /* Guarda o que veio na URL para aplicar quando as listas chegarem, e
       garante que a consulta automática rode uma única vez. */
    const daUrl = useRef<{ uf: string | null; cidade: string | null }>({ uf: null, cidade: null });
    const jaConsultouDaUrl = useRef(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        daUrl.current = { uf: params.get("uf"), cidade: params.get("cidade") };

        fetch("/api/localidades")
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then((lista: Estado[]) => {
                setEstados(lista);
                const pedido = daUrl.current.uf?.toUpperCase();
                const valido = pedido && lista.some((e) => e.sigla === pedido) ? pedido : null;
                setUf(valido ?? lista[0]?.sigla ?? "");
            })
            .catch(() => setErro("Não foi possível carregar os estados."));
    }, []);

    useEffect(() => {
        if (!uf) return;
        setMunicipios([]);
        setCidade("");

        fetch(`/api/localidades?uf=${encodeURIComponent(uf)}`)
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then((lista: Municipio[]) => {
                setMunicipios(lista);
                const pedida = daUrl.current.cidade;
                const valida = pedida && lista.some((m) => m.nome === pedida) ? pedida : null;
                setCidade(valida ?? lista[0]?.nome ?? "");
            })
            .catch(() => setErro("Não foi possível carregar os municípios."));
    }, [uf]);

    const consultar = useCallback(async () => {
        if (!cidade || !uf) return;

        setCarregando(true);
        setErro(null);

        try {
            const nomeEstado = estados.find((e) => e.sigla === uf)?.nome ?? uf;
            const resposta = await fetch(
                `/api/previsao?cidade=${encodeURIComponent(cidade)}&estado=${encodeURIComponent(nomeEstado)}`,
            );
            const dados = await resposta.json();

            if (!resposta.ok) throw new Error(dados?.erro ?? "Falha na consulta.");
            setPrevisao(dados);

            /* Deixa o relatório compartilhável: a URL passa a apontar para
               esta consulta, sem recarregar a página. */
            const params = new URLSearchParams({ uf, cidade });
            window.history.replaceState(null, "", `?${params}#relatorio`);
        } catch (e) {
            setPrevisao(null);
            setErro(e instanceof Error ? e.message : "Falha na consulta.");
        } finally {
            setCarregando(false);
        }
    }, [cidade, uf, estados]);

    /* Se a página foi aberta por um link compartilhado, consulta sozinha. */
    useEffect(() => {
        if (jaConsultouDaUrl.current) return;
        if (!daUrl.current.uf || !daUrl.current.cidade) return;
        if (!uf || !cidade || municipios.length === 0) return;
        if (cidade !== daUrl.current.cidade) return;

        jaConsultouDaUrl.current = true;
        consultar();
    }, [uf, cidade, municipios, consultar]);

    return (
        <section id="relatorio" className="container-app scroll-mt-24 py-24">
            <header className="mb-10 max-w-2xl">
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Monte seu relatório</h2>
                <p className="mt-3 text-texto-suave">
                    Escolha o estado e o município. Os dados são buscados na hora e o
                    relatório fica pronto para baixar em PDF.
                </p>
            </header>

            <div className="vidro rounded-2xl p-5 sm:p-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
                    <Campo rotulo="Estado" htmlFor="estado">
                        <select
                            id="estado"
                            value={uf}
                            onChange={(e) => setUf(e.target.value)}
                            className="w-full rounded-xl border border-borda bg-fundo-2 px-4 py-3 text-texto outline-none focus-visible:border-acento"
                        >
                            {estados.map((e) => (
                                <option key={e.sigla} value={e.sigla}>
                                    {e.nome}
                                </option>
                            ))}
                        </select>
                    </Campo>

                    <div className="flex min-w-0 flex-col gap-2">
                        <span className="text-xs font-semibold tracking-wider text-texto-suave uppercase">
                            Município
                        </span>
                        <SeletorMunicipio
                            municipios={municipios}
                            valor={cidade}
                            aoEscolher={setCidade}
                            desabilitado={municipios.length === 0}
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            type="button"
                            onClick={consultar}
                            disabled={carregando || !cidade}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-acento px-7 py-3 font-semibold text-fundo transition hover:bg-acento/85 disabled:opacity-50 lg:w-auto"
                        >
                            {carregando && <Loader2 className="size-4 animate-spin" />}
                            {carregando ? "Consultando…" : "Consultar"}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {erro && (
                        <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 flex items-center gap-2 text-sm font-medium text-rose-400"
                        >
                            <TriangleAlert className="size-4 shrink-0" />
                            {erro}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
                {previsao && (
                    <motion.div
                        key={`${previsao.cidade}-${previsao.coletadoEm}`}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="mt-8"
                    >
                        <Resultado previsao={previsao} />
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}

function Campo({
    rotulo,
    htmlFor,
    children,
}: {
    rotulo: string;
    htmlFor: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-w-0 flex-col gap-2">
            <label htmlFor={htmlFor} className="text-xs font-semibold tracking-wider text-texto-suave uppercase">
                {rotulo}
            </label>
            {children}
        </div>
    );
}

function Resultado({ previsao }: { previsao: Previsao }) {
    const { atual, qualidadeAr, horas, horaLocal } = previsao;
    const [linkCopiado, setLinkCopiado] = useState(false);

    async function copiarLink() {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setLinkCopiado(true);
            setTimeout(() => setLinkCopiado(false), 2200);
        } catch {
            /* Sem permissão de área de transferência: a URL já está na barra
               de endereços, então o link continua acessível. */
        }
    }

    const cards = [
        { rotulo: "Temperatura", valor: `${atual.temperatura}°C`, detalhe: `Sensação de ${atual.sensacao}°C` },
        { rotulo: "Condição", valor: atual.condicao, detalhe: `Umidade de ${atual.umidade}%`, texto: true },
        { rotulo: "Vento", valor: `${atual.vento} km/h`, detalhe: "Velocidade atual" },
    ];

    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((c, i) => (
                    <motion.article
                        key={c.rotulo}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07, duration: 0.4 }}
                        className="vidro rounded-2xl p-5"
                    >
                        <p className="text-xs font-semibold tracking-wider text-texto-suave uppercase">{c.rotulo}</p>
                        <p className={cn("mt-2 font-semibold tracking-tight", c.texto ? "text-xl" : "text-4xl")}>
                            {c.valor}
                        </p>
                        <p className="mt-1 text-sm text-texto-suave">{c.detalhe}</p>
                    </motion.article>
                ))}

                <motion.article
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.21, duration: 0.4 }}
                    className="vidro rounded-2xl p-5"
                >
                    <p className="text-xs font-semibold tracking-wider text-texto-suave uppercase">Qualidade do ar</p>
                    <p
                        className={cn(
                            "mt-2 inline-block rounded-full border px-3 py-1 text-lg font-semibold",
                            CORES_AR[qualidadeAr.nivel],
                        )}
                    >
                        {qualidadeAr.rotulo}
                    </p>
                    <p className="mt-2 text-sm text-texto-suave">
                        {qualidadeAr.indice ? `Índice DEFRA ${qualidadeAr.indice} de 10` : "Índice indisponível"}
                    </p>
                </motion.article>
            </div>

            {qualidadeAr.poluentes.length > 0 && (
                <div className="vidro rounded-2xl p-5">
                    <h3 className="mb-4 text-sm font-semibold tracking-wider text-texto-suave uppercase">
                        Poluentes <span className="normal-case">(µg/m³)</span>
                    </h3>
                    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                        {qualidadeAr.poluentes.map((p) => (
                            <li key={p.chave} className="rounded-xl border border-borda bg-fundo-2 px-3 py-2.5">
                                <span className="block text-xs font-semibold text-texto-suave">{p.nome}</span>
                                <span className="block text-lg font-semibold tabular-nums">{p.valor.toFixed(1)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-texto-suave">
                    {previsao.cidade} — {previsao.estado} · coletado às{" "}
                    {new Date(previsao.coletadoEm).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </p>
                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={copiarLink}
                        className="inline-flex items-center gap-2 rounded-xl border border-borda px-5 py-2.5 text-sm font-semibold transition hover:border-acento hover:text-acento"
                    >
                        {linkCopiado ? <Check className="size-4 text-emerald-400" /> : <Link2 className="size-4" />}
                        {linkCopiado ? "Link copiado" : "Copiar link"}
                    </button>
                    <button
                        type="button"
                        onClick={() => exportarPdf(previsao)}
                        className="inline-flex items-center gap-2 rounded-xl border border-borda px-5 py-2.5 text-sm font-semibold transition hover:border-acento hover:text-acento"
                    >
                        <Download className="size-4" />
                        Baixar PDF
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-borda">
                <table className="w-full min-w-[640px] border-collapse text-sm">
                    <caption className="sr-only">Previsão hora a hora</caption>
                    <thead>
                        <tr className="bg-fundo-2 text-xs tracking-wider text-texto-suave uppercase">
                            {["Horário", "Condição", "Chuva", "Temp.", "Sensação", "Umidade", "Vento"].map((h) => (
                                <th key={h} scope="col" className="px-4 py-3 text-center font-semibold first:text-left">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {horas.map((h) => {
                            const hora = Number(h.hora.split(":")[0]);
                            const agora = hora === horaLocal;
                            return (
                                <tr
                                    key={h.hora}
                                    className={cn(
                                        "border-t border-borda transition",
                                        agora && "bg-acento/10 font-semibold",
                                        hora < horaLocal && !agora && "text-texto-suave",
                                    )}
                                >
                                    <td className="px-4 py-2.5 text-left tabular-nums">{h.hora}</td>
                                    <td className="px-4 py-2.5 text-center">{h.condicao}</td>
                                    <td className="px-4 py-2.5 text-center tabular-nums">{h.chuva}%</td>
                                    <td className="px-4 py-2.5 text-center tabular-nums">{h.temperatura}°C</td>
                                    <td className="px-4 py-2.5 text-center tabular-nums">{h.sensacao}°C</td>
                                    <td className="px-4 py-2.5 text-center tabular-nums">{h.umidade}%</td>
                                    <td className="px-4 py-2.5 text-center tabular-nums">{h.vento} km/h</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
