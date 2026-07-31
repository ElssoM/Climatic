document.addEventListener("DOMContentLoaded", () => {
    carregarEstados();
    document.getElementById("periodoColeta").value = new Date().toLocaleDateString("pt-BR");
});

function obterChaveApi() {
    if (window.WEATHER_API_KEY && window.WEATHER_API_KEY !== "SUA_CHAVE_AQUI") {
        return window.WEATHER_API_KEY;
    }
    return null;
}

function mostrarErro(mensagem) {
    const info = document.getElementById("infoColeta");
    info.textContent = mensagem;
    info.style.color = "#b00020";
}

async function carregarEstados() {
    try {
        const response = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome");
        if (!response.ok) throw new Error("Falha ao carregar estados do IBGE.");
        const estados = await response.json();
        const selectEstado = document.getElementById("estado");
        estados.forEach((estado) => {
            const option = document.createElement("option");
            option.value = estado.sigla;
            option.textContent = estado.nome;
            selectEstado.appendChild(option);
        });
        await carregarCidades();
    } catch (error) {
        mostrarErro(error.message || "Não foi possível carregar os estados.");
    }
}

async function carregarCidades() {
    const estado = document.getElementById("estado").value;
    if (!estado) return;

    try {
        const response = await fetch(
            `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios?orderBy=nome`
        );
        if (!response.ok) throw new Error("Falha ao carregar cidades do IBGE.");
        const cidades = await response.json();
        const selectCidade = document.getElementById("cidade");
        selectCidade.innerHTML = "";
        cidades.forEach((cidade) => {
            const option = document.createElement("option");
            option.value = cidade.nome;
            option.textContent = cidade.nome;
            selectCidade.appendChild(option);
        });
        await atualizarDados();
    } catch (error) {
        mostrarErro(error.message || "Não foi possível carregar as cidades.");
    }
}

async function atualizarDados() {
    const cidade = document.getElementById("cidade").value;
    const apiKey = obterChaveApi();

    if (!cidade) return;

    if (!apiKey) {
        mostrarErro("Configure sua chave da WeatherAPI em config.js (veja config.example.js).");
        return;
    }

    const info = document.getElementById("infoColeta");
    info.style.color = "";
    info.textContent = `Carregando dados climáticos de ${cidade}...`;

    try {
        const url = `https://api.weatherapi.com/v1/forecast.json?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(cidade)},BR&days=1&aqi=yes&lang=pt`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Não foi possível obter a previsão para esta cidade.");

        const data = await response.json();
        const indiceAr = data.current?.air_quality?.["gb-defra-index"] ?? 1;
        document.getElementById("indiceAr").textContent = indiceAr <= 3 ? "Boa" : "Moderada";

        const horario = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        info.textContent = `No dia ${new Date().toLocaleDateString("pt-BR")} às ${horario} foram coletados dados climáticos de ${cidade}.`;

        const previsao24h = data.forecast.forecastday[0].hour;
        const tabela = document.getElementById("tabelaPrevisao").getElementsByTagName("tbody")[0];
        tabela.innerHTML = "";

        previsao24h.forEach((hora) => {
            const row = tabela.insertRow();
            row.innerHTML = `
                <td>${hora.time.split(" ")[1]}</td>
                <td>${hora.condition.text}</td>
                <td>${hora.chance_of_rain}%</td>
                <td>${hora.temp_c}°C</td>
                <td>${hora.feelslike_c}°C</td>
                <td>${hora.humidity}%</td>
                <td>${hora.wind_kph} km/h</td>
            `;
        });
    } catch (error) {
        mostrarErro(error.message || "Erro ao atualizar os dados climáticos.");
    }
}

async function salvarPDF(elemento, filename) {
    const options = {
        margin: [10, 10, 10, 10],
        filename: filename + ".pdf",
        image: { type: "png", quality: 1 },
        html2canvas: { scale: 1 },
        jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
    };
    html2pdf().set(options).from(elemento).save();
}
