document.addEventListener("DOMContentLoaded", () => {
    carregarEstados();
    document.getElementById("periodoColeta").value = new Date().toLocaleDateString("pt-BR");
});

async function carregarEstados() {
    const response = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados");
    const estados = await response.json();
    const selectEstado = document.getElementById("estado");
    estados.forEach(estado => {
        const option = document.createElement("option");
        option.value = estado.sigla;
        option.textContent = estado.nome;
        selectEstado.appendChild(option);
    });
}

async function carregarCidades() {
    const estado = document.getElementById("estado").value;
    const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios`);
    const cidades = await response.json();
    const selectCidade = document.getElementById("cidade");
    selectCidade.innerHTML = "";
    cidades.forEach(cidade => {
        const option = document.createElement("option");
        option.value = cidade.nome;
        option.textContent = cidade.nome;
        selectCidade.appendChild(option);
    });
}

async function atualizarDados() {
    const cidade = document.getElementById("cidade").value;
    const apiKey = "f53aceda00a34f56bc714002240811";
    const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${cidade}&days=1&aqi=yes&alerts=yes&lang=pt`);
    const data = await response.json();
    
    // Atualize informações da qualidade do ar
    const qualidadeAr = data.current.air_quality['gb-defra-index'];
    document.getElementById("indiceAr").textContent = qualidadeAr <= 3 ? "Boa" : "Moderada";

    // Atualize informações de coleta
    const horario = new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
    document.getElementById("infoColeta").textContent = `No dia ${new Date().toLocaleDateString("pt-BR")} às ${horario} foram coletados dados climáticos de ${cidade}.`;

    // Atualize a tabela de previsão
    const previsao24h = data.forecast.forecastday[0].hour;
    const tabela = document.getElementById("tabelaPrevisao").getElementsByTagName("tbody")[0];
    tabela.innerHTML = "";
    previsao24h.forEach(hora => {
        const row = tabela.insertRow();
        row.innerHTML = `
            <td>${hora.time.split(" ")[1]}</td>
            <td>${hora.condition.text}</td>
            <td>${hora.precip_mm}%</td>
            <td>${hora.temp_c}°C</td>
            <td>${hora.feelslike_c}°C</td>
            <td>${hora.humidity}%</td>
            <td>${hora.wind_kph} Kph</td>
        `;
    });
}

async function salvarPDF(elemento, filename) {
    const options = {
        margin: [10, 10, 10, 10],
        filename: filename + ".pdf",
        image: { type: 'png', quality: 1 },
        html2canvas: { scale: 1 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    html2pdf().set(options).from(elemento).save();
}
