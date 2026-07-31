import { NextResponse } from "next/server";
import { classificarAr } from "@/lib/ar";
import type { Previsao } from "@/lib/tipos";

/**
 * A chave vive apenas aqui, no servidor. O navegador chama esta rota e nunca
 * vê `WEATHER_API_KEY` — diferente da versão estática, em que a chave ia junto
 * com o JavaScript e aparecia no DevTools de qualquer visitante.
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const cidade = searchParams.get("cidade");
    const estado = searchParams.get("estado") ?? "";

    if (!cidade) {
        return NextResponse.json({ erro: "Informe a cidade." }, { status: 400 });
    }

    const chave = process.env.WEATHER_API_KEY;
    if (!chave) {
        return NextResponse.json(
            { erro: "O servidor está sem WEATHER_API_KEY configurada. Veja o .env.example." },
            { status: 500 },
        );
    }

    const url =
        `https://api.weatherapi.com/v1/forecast.json` +
        `?key=${encodeURIComponent(chave)}` +
        `&q=${encodeURIComponent(`${cidade},${estado},BR`)}` +
        `&days=1&aqi=yes&lang=pt`;

    try {
        /* 10 minutos de cache: a previsão horária não muda a cada clique e
           isso segura o consumo da cota gratuita. */
        const resposta = await fetch(url, { next: { revalidate: 600 } });

        if (!resposta.ok) {
            const detalhe = await resposta.json().catch(() => null);
            const mensagem = detalhe?.error?.message ?? "Não foi possível obter a previsão.";

            /* 401/403 são problema de configuração do servidor, não do visitante:
               não repassamos o status original para não expor detalhe da chave. */
            const status = resposta.status === 401 || resposta.status === 403 ? 500 : resposta.status;
            return NextResponse.json({ erro: mensagem }, { status });
        }

        const dados = (await resposta.json()) as RespostaWeatherApi;
        return NextResponse.json(normalizar(dados, cidade, estado));
    } catch {
        return NextResponse.json({ erro: "Falha ao consultar a WeatherAPI." }, { status: 502 });
    }
}

/* Só os campos que realmente consumimos da WeatherAPI. */
type RespostaWeatherApi = {
    location: { localtime: string };
    current: {
        temp_c: number;
        feelslike_c: number;
        condition: { text: string };
        humidity: number;
        wind_kph: number;
        air_quality?: Record<string, number>;
    };
    forecast: {
        forecastday: {
            hour: {
                time: string;
                condition: { text: string };
                chance_of_rain: number;
                temp_c: number;
                feelslike_c: number;
                humidity: number;
                wind_kph: number;
            }[];
        }[];
    };
};

function normalizar(dados: RespostaWeatherApi, cidade: string, estado: string): Previsao {
    const atual = dados.current;
    const horaLocal = Number(String(dados.location.localtime).split(" ")[1].split(":")[0]);

    return {
        cidade,
        estado,
        coletadoEm: new Date().toISOString(),
        horaLocal,
        atual: {
            temperatura: Math.round(atual.temp_c),
            sensacao: Math.round(atual.feelslike_c),
            condicao: atual.condition.text,
            umidade: atual.humidity,
            vento: Math.round(atual.wind_kph),
        },
        qualidadeAr: classificarAr(atual.air_quality?.["gb-defra-index"], atual.air_quality),
        horas: dados.forecast.forecastday[0].hour.map((h) => ({
            hora: String(h.time).split(" ")[1],
            condicao: h.condition.text,
            chuva: h.chance_of_rain,
            temperatura: Math.round(h.temp_c),
            sensacao: Math.round(h.feelslike_c),
            umidade: h.humidity,
            vento: Math.round(h.wind_kph),
        })),
    };
}
