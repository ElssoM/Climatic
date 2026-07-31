# Climatic 🌤️

Aplicação web que monta um relatório climático de qualquer município brasileiro e permite exportá-lo em PDF.

## Como funciona

1. Selecione o **estado** — a lista vem da API de localidades do IBGE
2. Selecione a **cidade** — carregada dinamicamente conforme o estado escolhido
3. O app busca a previsão do dia na **WeatherAPI** e monta a tabela hora a hora
4. Clique em salvar para exportar o relatório em PDF

## O que o relatório mostra

Para cada hora do dia: condição do tempo, probabilidade de chuva, temperatura, sensação térmica, umidade e velocidade do vento — além da qualidade do ar do município.

## Tecnologias

`JavaScript` · `HTML` · `CSS` · [jsPDF](https://github.com/parallax/jsPDF)

## APIs utilizadas

| API | Uso |
| :--- | :--- |
| [IBGE Localidades](https://servicodados.ibge.gov.br/api/docs/localidades) | Lista de estados e municípios |
| [WeatherAPI](https://www.weatherapi.com/) | Previsão do tempo e qualidade do ar |

## Como rodar

```bash
git clone https://github.com/ElssoM/Climatic.git
```

Abra o `index.html` no navegador. Não há dependências nem etapa de build.

1. Copie `config.example.js` para `config.js`
2. Informe sua chave gratuita da [WeatherAPI](https://www.weatherapi.com/) em `window.WEATHER_API_KEY`

> **Nota:** `config.js` não deve ser commitado (já está no `.gitignore`).

## Contribuindo

Pull requests são bem-vindos! Abra uma issue ou PR descrevendo a melhoria.

Fork → branch → PR para `main`.

## Exemplo

O arquivo `Relatorio_Climatico quatis 07112024.pdf` é uma amostra da saída gerada pelo app.
