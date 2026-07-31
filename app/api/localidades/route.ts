import { NextResponse } from "next/server";

const IBGE = "https://servicodados.ibge.gov.br/api/v1/localidades";

/**
 * A API do IBGE é pública e não usa chave — passa por aqui só para aproveitar
 * o cache do Next e evitar 27 requisições do navegador a cada visita.
 * Sem `uf` devolve os estados; com `uf`, os municípios daquele estado.
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const uf = searchParams.get("uf");

    const url = uf
        ? `${IBGE}/estados/${encodeURIComponent(uf)}/municipios?orderBy=nome`
        : `${IBGE}/estados?orderBy=nome`;

    try {
        /* Divisão político-administrativa muda muito raramente: cache de 24h. */
        const resposta = await fetch(url, { next: { revalidate: 86400 } });
        if (!resposta.ok) throw new Error();

        const dados = await resposta.json();

        return NextResponse.json(
            uf
                ? dados.map((m: { nome: string }) => ({ nome: m.nome }))
                : dados.map((e: { sigla: string; nome: string }) => ({ sigla: e.sigla, nome: e.nome })),
        );
    } catch {
        return NextResponse.json(
            { erro: uf ? "Falha ao carregar os municípios." : "Falha ao carregar os estados." },
            { status: 502 },
        );
    }
}
