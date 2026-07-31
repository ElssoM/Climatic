import { NextResponse } from "next/server";

/** Cidades do painel. `q` é o que a WeatherAPI entende; `nome` é o que aparece. */
const CIDADES = [
    { nome: "Nova York", pais: "EUA", q: "New York" },
    { nome: "Londres", pais: "Reino Unido", q: "London" },
    { nome: "Paris", pais: "França", q: "Paris" },
    { nome: "Lisboa", pais: "Portugal", q: "Lisbon" },
    { nome: "Tóquio", pais: "Japão", q: "Tokyo" },
    { nome: "Dubai", pais: "Emirados Árabes", q: "Dubai" },
    { nome: "Sydney", pais: "Austrália", q: "Sydney" },
    { nome: "Cidade do México", pais: "México", q: "Mexico City" },
] as const;

type CidadeMundo = {
    nome: string;
    pais: string;
    temperatura: number;
    condicao: string;
    horaLocal: string;
    ehDia: boolean;
};

export async function GET() {
    const chave = process.env.WEATHER_API_KEY;
    if (!chave) {
        return NextResponse.json({ erro: "Servidor sem WEATHER_API_KEY." }, { status: 500 });
    }

    /* Uma requisição por cidade, todas em paralelo. O cache de 10 minutos
       evita repetir isso a cada visita — são 8 chamadas por janela, não por
       visitante. */
    const resultados = await Promise.allSettled(
        CIDADES.map(async (cidade): Promise<CidadeMundo> => {
            const url =
                `https://api.weatherapi.com/v1/current.json` +
                `?key=${encodeURIComponent(chave)}` +
                `&q=${encodeURIComponent(cidade.q)}&lang=pt`;

            const resposta = await fetch(url, { next: { revalidate: 600 } });
            if (!resposta.ok) throw new Error(cidade.nome);

            const dados = await resposta.json();
            return {
                nome: cidade.nome,
                pais: cidade.pais,
                temperatura: Math.round(dados.current.temp_c),
                condicao: dados.current.condition.text,
                horaLocal: String(dados.location.localtime).split(" ")[1],
                ehDia: dados.current.is_day === 1,
            };
        }),
    );

    /* Uma cidade que falhou não derruba o painel inteiro. */
    const cidades = resultados
        .filter((r): r is PromiseFulfilledResult<CidadeMundo> => r.status === "fulfilled")
        .map((r) => r.value);

    if (cidades.length === 0) {
        return NextResponse.json({ erro: "Nenhuma cidade respondeu." }, { status: 502 });
    }

    return NextResponse.json(cidades);
}
