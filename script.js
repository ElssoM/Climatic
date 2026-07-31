"use strict";

const IBGE = "https://servicodados.ibge.gov.br/api/v1/localidades";
const COLUNAS_PDF = ["Horário", "Condição", "Chuva", "Temperatura", "Sensação", "Umidade", "Vento"];

/* Faixas oficiais do índice DEFRA (1 a 10). */
const FAIXAS_AR = [
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
];

/* Última consulta bem-sucedida — usada para gerar o PDF. */
let ultimoRelatorio = null;

const el = (id) => document.getElementById(id);

document.addEventListener("DOMContentLoaded", () => {
    aplicarTemaSalvo();
    el("periodoColeta").value = new Date().toLocaleDateString("pt-BR");

    el("estado").addEventListener("change", carregarCidades);
    el("cidade").addEventListener("change", atualizarDados);
    el("btnSalvar").addEventListener("click", salvarPDF);
    el("btnTema").addEventListener("click", alternarTema);
    el("formConsulta").addEventListener("submit", (e) => e.preventDefault());

    carregarEstados();
});

/* ---------------------------------------------------------------- tema */

function aplicarTemaSalvo() {
    const salvo = localStorage.getItem("climatic:tema");
    if (salvo === "claro" || salvo === "escuro") {
        document.documentElement.dataset.tema = salvo;
    }
}

function alternarTema() {
    const escuroAtivo =
        document.documentElement.dataset.tema === "escuro" ||
        (!document.documentElement.dataset.tema &&
            window.matchMedia("(prefers-color-scheme: dark)").matches);

    const novo = escuroAtivo ? "claro" : "escuro";
    document.documentElement.dataset.tema = novo;
    localStorage.setItem("climatic:tema", novo);
}

/* ------------------------------------------------------------ mensagens */

function mostrarInfo(mensagem, ehErro = false) {
    const info = el("infoColeta");
    info.textContent = mensagem;
    info.classList.toggle("erro", ehErro);
}

function linhaMensagem(texto, classe) {
    const tbody = el("tabelaPrevisao").tBodies[0];
    tbody.innerHTML = `<tr class="${classe}"><td colspan="7">${texto}</td></tr>`;
}

function obterChaveApi() {
    const chave = window.WEATHER_API_KEY;
    return chave && chave !== "SUA_CHAVE_AQUI" ? chave : null;
}

/* ------------------------------------------------------------- IBGE */

async function carregarEstados() {
    const selectEstado = el("estado");
    selectEstado.innerHTML = `<option value="">Carregando…</option>`;

    try {
        const response = await fetch(`${IBGE}/estados?orderBy=nome`);
        if (!response.ok) throw new Error("Falha ao carregar os estados do IBGE.");

        const estados = await response.json();
        selectEstado.innerHTML = "";
        estados.forEach((estado) => {
            selectEstado.add(new Option(estado.nome, estado.sigla));
        });

        await carregarCidades();
    } catch (error) {
        selectEstado.innerHTML = `<option value="">—</option>`;
        mostrarInfo(error.message || "Não foi possível carregar os estados.", true);
    }
}

async function carregarCidades() {
    const estado = el("estado").value;
    const selectCidade = el("cidade");
    if (!estado) return;

    selectCidade.innerHTML = `<option value="">Carregando…</option>`;

    try {
        const response = await fetch(`${IBGE}/estados/${estado}/municipios?orderBy=nome`);
        if (!response.ok) throw new Error("Falha ao carregar os municípios do IBGE.");

        const cidades = await response.json();
        selectCidade.innerHTML = "";
        cidades.forEach((cidade) => {
            selectCidade.add(new Option(cidade.nome, cidade.nome));
        });

        await atualizarDados();
    } catch (error) {
        selectCidade.innerHTML = `<option value="">—</option>`;
        mostrarInfo(error.message || "Não foi possível carregar os municípios.", true);
    }
}

/* --------------------------------------------------------- WeatherAPI */

async function atualizarDados() {
    const cidade = el("cidade").value;
    const estado = el("estado").selectedOptions[0]?.textContent ?? "";
    const apiKey = obterChaveApi();

    if (!cidade) return;

    if (!apiKey) {
        mostrarInfo("Configure sua chave da WeatherAPI em config.js (veja config.example.js).", true);
        linhaMensagem("Sem chave da API configurada.", "linha-vazia");
        return;
    }

    definirCarregando(true);
    mostrarInfo(`Carregando dados climáticos de ${cidade}…`);
    linhaMensagem("Carregando previsão…", "linha-carregando");

    try {
        const url =
            `https://api.weatherapi.com/v1/forecast.json` +
            `?key=${encodeURIComponent(apiKey)}` +
            `&q=${encodeURIComponent(`${cidade},${estado},BR`)}` +
            `&days=1&aqi=yes&lang=pt`;

        const response = await fetch(url);
        if (!response.ok) {
            const detalhe = await response.json().catch(() => null);
            throw new Error(detalhe?.error?.message || "Não foi possível obter a previsão para este município.");
        }

        const dados = await response.json();
        renderizar(dados, cidade, estado);
    } catch (error) {
        ultimoRelatorio = null;
        el("resumo").hidden = true;
        el("poluentesSecao").hidden = true;
        linhaMensagem("Nenhum dado disponível.", "linha-vazia");
        mostrarInfo(error.message || "Erro ao atualizar os dados climáticos.", true);
    } finally {
        definirCarregando(false);
    }
}

function definirCarregando(carregando) {
    el("btnSalvar").disabled = carregando || !ultimoRelatorio;
    el("estado").disabled = carregando;
    el("cidade").disabled = carregando;
}

/* --------------------------------------------------------- renderização */

function renderizar(dados, cidade, estado) {
    const atual = dados.current;
    const horas = dados.forecast.forecastday[0].hour;
    const horaLocal = Number(dados.location.localtime.split(" ")[1].split(":")[0]);

    el("tempAtual").textContent = `${Math.round(atual.temp_c)}°C`;
    el("sensacaoAtual").textContent = `Sensação de ${Math.round(atual.feelslike_c)}°C`;
    el("condicaoAtual").textContent = atual.condition.text;
    el("ventoAtual").textContent = `Vento de ${Math.round(atual.wind_kph)} km/h · umidade ${atual.humidity}%`;

    const faixa = classificarAr(atual.air_quality?.["gb-defra-index"]);
    const selo = el("indiceAr");
    selo.textContent = faixa.rotulo;
    selo.dataset.nivel = faixa.nivel;
    el("indiceArDetalhe").textContent = faixa.indice
        ? `Índice DEFRA ${faixa.indice} de 10`
        : "Índice indisponível";

    el("resumo").hidden = false;
    renderizarPoluentes(atual.air_quality);
    renderizarTabela(horas, horaLocal);

    const agora = new Date();
    mostrarInfo(
        `Dados de ${cidade} — ${estado}, coletados em ${agora.toLocaleDateString("pt-BR")} às ` +
        `${agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}.`
    );

    ultimoRelatorio = { cidade, estado, horas, faixa, atual, coletadoEm: agora };
    el("btnSalvar").disabled = false;
}

function classificarAr(indice) {
    if (typeof indice !== "number") {
        return { rotulo: "Indisponível", nivel: "baixa", indice: null };
    }
    const faixa = FAIXAS_AR.find((f) => indice <= f.limite) ?? FAIXAS_AR[FAIXAS_AR.length - 1];
    return { ...faixa, indice };
}

function renderizarPoluentes(qualidadeAr) {
    const lista = el("poluentes");
    const secao = el("poluentesSecao");

    if (!qualidadeAr) {
        secao.hidden = true;
        return;
    }

    const itens = POLUENTES.filter(({ chave }) => typeof qualidadeAr[chave] === "number");
    if (itens.length === 0) {
        secao.hidden = true;
        return;
    }

    lista.innerHTML = itens
        .map(({ chave, nome }) => `
            <li>
                <span class="poluente-nome">${nome}</span>
                <span class="poluente-valor">${qualidadeAr[chave].toFixed(1)}</span>
            </li>
        `)
        .join("");

    secao.hidden = false;
}

function renderizarTabela(horas, horaLocal) {
    const tbody = el("tabelaPrevisao").tBodies[0];

    tbody.innerHTML = horas
        .map((hora) => {
            const h = Number(hora.time.split(" ")[1].split(":")[0]);
            const classe = h === horaLocal ? "agora" : h < horaLocal ? "passado" : "";
            return `
                <tr class="${classe}">
                    <td class="numero">${hora.time.split(" ")[1]}</td>
                    <td>${hora.condition.text}</td>
                    <td class="numero">${hora.chance_of_rain}%</td>
                    <td class="numero">${Math.round(hora.temp_c)}°C</td>
                    <td class="numero">${Math.round(hora.feelslike_c)}°C</td>
                    <td class="numero">${hora.humidity}%</td>
                    <td class="numero">${Math.round(hora.wind_kph)} km/h</td>
                </tr>
            `;
        })
        .join("");
}

/* ---------------------------------------------------------------- PDF */

function salvarPDF() {
    if (!ultimoRelatorio) return;

    const construtor = window.jspdf?.jsPDF;
    if (!construtor) {
        mostrarInfo("A biblioteca de PDF não carregou. Verifique sua conexão e recarregue a página.", true);
        return;
    }

    const { cidade, estado, horas, faixa, atual, coletadoEm } = ultimoRelatorio;
    const doc = new construtor({ unit: "mm", format: "a4", orientation: "landscape" });
    const larguraPagina = doc.internal.pageSize.getWidth();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Relatório Climático", 14, 16);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`${cidade} — ${estado}`, 14, 23);
    doc.text(
        `Coletado em ${coletadoEm.toLocaleDateString("pt-BR")} às ` +
        `${coletadoEm.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
        14, 28
    );

    const resumo =
        `Temperatura ${Math.round(atual.temp_c)}°C (sensação ${Math.round(atual.feelslike_c)}°C)  ·  ` +
        `${atual.condition.text}  ·  Umidade ${atual.humidity}%  ·  ` +
        `Vento ${Math.round(atual.wind_kph)} km/h  ·  Qualidade do ar: ${faixa.rotulo}` +
        (faixa.indice ? ` (DEFRA ${faixa.indice}/10)` : "");
    doc.text(resumo, 14, 34);

    doc.autoTable({
        startY: 39,
        head: [COLUNAS_PDF],
        body: horas.map((hora) => [
            hora.time.split(" ")[1],
            hora.condition.text,
            `${hora.chance_of_rain}%`,
            `${Math.round(hora.temp_c)}°C`,
            `${Math.round(hora.feelslike_c)}°C`,
            `${hora.humidity}%`,
            `${Math.round(hora.wind_kph)} km/h`,
        ]),
        styles: { font: "helvetica", fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [37, 99, 235], textColor: 255, halign: "center" },
        columnStyles: { 1: { halign: "left" } },
        bodyStyles: { halign: "center" },
        alternateRowStyles: { fillColor: [246, 248, 252] },
        didDrawPage: () => {
            doc.setFontSize(8);
            doc.setTextColor(120);
            doc.text(
                "Fontes: IBGE (municípios) e WeatherAPI (previsão)",
                14,
                doc.internal.pageSize.getHeight() - 8
            );
            doc.text(
                `Página ${doc.internal.getNumberOfPages()}`,
                larguraPagina - 14,
                doc.internal.pageSize.getHeight() - 8,
                { align: "right" }
            );
            doc.setTextColor(0);
        },
    });

    const dataArquivo = coletadoEm.toISOString().slice(0, 10);
    const nomeCidade = cidade
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase();
    doc.save(`relatorio-climatico-${nomeCidade}-${dataArquivo}.pdf`);
}
