import type { NivelAr, QualidadeAr } from "./tipos";

/**
 * Faixas oficiais do índice DEFRA (1 a 10). O app antigo tratava o índice
 * como binário (`<= 3 ? "Boa" : "Moderada"`), o que exibia poluição alta e
 * muito alta como "Moderada" — justamente os casos que importam.
 */
const FAIXAS: { limite: number; rotulo: string; nivel: NivelAr }[] = [
    { limite: 3, rotulo: "Baixa", nivel: "baixa" },
    { limite: 6, rotulo: "Moderada", nivel: "moderada" },
    { limite: 9, rotulo: "Alta", nivel: "alta" },
    { limite: 10, rotulo: "Muito alta", nivel: "muito-alta" },
];

const POLUENTES = [
    { chave: "pm2_5", nome: "PM2,5" },
    { chave: "pm10", nome: "PM10" },
    { chave: "o3", nome: "O₃" },
    { chave: "no2", nome: "NO₂" },
    { chave: "so2", nome: "SO₂" },
    { chave: "co", nome: "CO" },
] as const;

export const CORES_AR: Record<NivelAr, string> = {
    baixa: "text-emerald-400 border-emerald-400/40 bg-emerald-400/10",
    moderada: "text-amber-400 border-amber-400/40 bg-amber-400/10",
    alta: "text-orange-400 border-orange-400/40 bg-orange-400/10",
    "muito-alta": "text-rose-400 border-rose-400/40 bg-rose-400/10",
    indisponivel: "text-slate-400 border-slate-400/40 bg-slate-400/10",
};

export function classificarAr(
    indice: unknown,
    dados: Record<string, unknown> | undefined,
): QualidadeAr {
    const poluentes = POLUENTES.flatMap(({ chave, nome }) => {
        const valor = dados?.[chave];
        return typeof valor === "number" ? [{ chave, nome, valor }] : [];
    });

    if (typeof indice !== "number") {
        return { nivel: "indisponivel", rotulo: "Indisponível", indice: null, poluentes };
    }

    const faixa = FAIXAS.find((f) => indice <= f.limite) ?? FAIXAS[FAIXAS.length - 1];
    return { nivel: faixa.nivel, rotulo: faixa.rotulo, indice, poluentes };
}
