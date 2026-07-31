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

### Configurando a chave da WeatherAPI

O app precisa de uma chave gratuita da [WeatherAPI](https://www.weatherapi.com/signup.aspx). Há duas formas de informá-la:

**Pela interface** — abra o app e cole a chave no campo que aparece. Ela fica salva apenas no seu navegador (`localStorage`), o que evita mexer em arquivos e funciona bem quando várias pessoas usam a mesma cópia do projeto.

**Por arquivo** — copie `config.example.js` para `config.js` e preencha `window.WEATHER_API_KEY`. Útil para deixar a chave fixa em uma máquina de desenvolvimento. O `config.js` está no `.gitignore` e não deve ser commitado.

Quando as duas existem, o `config.js` tem precedência. Se a WeatherAPI recusar a chave (HTTP 401 ou 403), o app descarta a que estava salva no navegador e pede outra.

> ⚠️ Por ser um site estático, a chave fica visível no navegador de quem acessa. Isso é aceitável para uso local ou pessoal — mas se o app for publicado, a chave precisa sair do front-end e ficar atrás de um proxy no servidor.

## Contribuindo

Pull requests são bem-vindos! Abra uma issue ou PR descrevendo a melhoria.

Fork → branch → PR para `main`.

## Exemplo

O arquivo `Relatorio_Climatico quatis 07112024.pdf` é uma amostra da saída gerada pelo app.
