# Climatic 🌤️

Relatório climático de qualquer município brasileiro: previsão hora a hora, qualidade do ar por poluente e exportação em PDF.

Reconstrução do [Climatic original](https://github.com/ElssoM/Climatic) em Next.js, com a chave da API protegida no servidor.

## Por que a reconstrução

A versão estática funcionava, mas tinha limites que não davam para resolver sem backend:

| Problema | Como está agora |
| :--- | :--- |
| Chave da WeatherAPI ia no JavaScript e aparecia no DevTools de qualquer visitante | A consulta acontece em `/api/previsao`, no servidor. A chave nunca é enviada ao navegador |
| Índice DEFRA tratado como binário — poluição alta exibida como "Moderada" | Quatro faixas oficiais: Baixa (1-3), Moderada (4-6), Alta (7-9), Muito alta (10) |
| PDF rasterizado pelo html2pdf: ~3 MB, sem um caractere selecionável | jsPDF + autoTable, com texto pesquisável e copiável em ~44 KB |
| 27 requisições ao IBGE a cada visita | Rota com cache de 24h para localidades e 10 min para a previsão |

## Stack

`Next.js 15` · `React 19` · `TypeScript` · `Tailwind CSS 4` · `GSAP` · `Lenis` · `Framer Motion` · `React Three Fiber` + `Drei` · `jsPDF`

## Configuração

```bash
npm install
cp .env.example .env.local
```

Preencha `WEATHER_API_KEY` no `.env.local` com sua chave gratuita da [WeatherAPI](https://www.weatherapi.com/signup.aspx).

> A variável **não** tem o prefixo `NEXT_PUBLIC_`. Isso é proposital: sem o prefixo, o Next mantém o valor apenas no servidor e ele nunca entra no bundle do cliente. `.env.local` está no `.gitignore`.

```bash
npm run dev
```

## Rotas de API

| Rota | O que faz | Cache |
| :--- | :--- | :--- |
| `GET /api/localidades` | Lista os 27 estados (IBGE) | 24h |
| `GET /api/localidades?uf=SP` | Lista os municípios do estado (IBGE) | 24h |
| `GET /api/previsao?cidade=&estado=` | Previsão e qualidade do ar (WeatherAPI) | 10 min |
| `GET /api/mundo` | Temperatura atual de 8 capitais (WeatherAPI) | 10 min |

O `/api/mundo` dispara as 8 consultas em paralelo com `Promise.allSettled`: uma capital que falhe sai do painel sem derrubar as outras. O cache faz as 8 chamadas valerem por janela de 10 minutos, não por visitante.

## Tipografia

| Uso | Fonte | Por quê |
| :--- | :--- | :--- |
| Títulos | **Sora** 600/700 | Geométrica, com personalidade nos tamanhos grandes |
| Texto | **Inter** | Desenhada para leitura em tela, ótima em corpo pequeno |
| Números | **JetBrains Mono** 400/500 | Largura fixa mantém as colunas da tabela alinhadas |

Tabelas e valores usam `font-variant-numeric: tabular-nums` e `font-feature-settings: "zero" 1`, que ativa o zero cortado — em dado numérico, `0` não pode ser confundido com `O`.

## Desempenho e acessibilidade

A cena 3D do topo é carregada sob demanda (`next/dynamic` com `ssr: false`) e só entra quando o aparelho comporta: tela de 1024px ou mais, pelo menos 4 GB de memória e 4 núcleos. Fora disso — celular, aparelho modesto, ou quem ativou *prefers-reduced-motion* — a página serve um gradiente com o mesmo clima visual, e o chunk do `three` sequer é baixado.

A rolagem suave do Lenis e as animações de GSAP e Framer Motion também respeitam `prefers-reduced-motion`.

## Scripts

```bash
npm run dev        # desenvolvimento com Turbopack
npm run build      # build de produção
npm run lint       # ESLint
```
