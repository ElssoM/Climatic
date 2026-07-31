import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Previsao } from "./tipos";

/**
 * Gera PDF com texto de verdade — pesquisável e copiável. A versão anterior
 * usava html2pdf, que rasterizava a tela: o relatório saía como imagem de
 * ~3 MB sem um único caractere selecionável.
 */
export function exportarPdf(previsao: Previsao) {
    const { cidade, estado, atual, qualidadeAr, horas } = previsao;
    const coletadoEm = new Date(previsao.coletadoEm);

    const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
    const largura = doc.internal.pageSize.getWidth();
    const altura = doc.internal.pageSize.getHeight();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Relatório Climático", 14, 16);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`${cidade} — ${estado}`, 14, 23);
    doc.text(
        `Coletado em ${coletadoEm.toLocaleDateString("pt-BR")} às ` +
            `${coletadoEm.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
        14,
        28,
    );

    doc.text(
        `Temperatura ${atual.temperatura}°C (sensação ${atual.sensacao}°C)  ·  ${atual.condicao}  ·  ` +
            `Umidade ${atual.umidade}%  ·  Vento ${atual.vento} km/h  ·  ` +
            `Qualidade do ar: ${qualidadeAr.rotulo}` +
            (qualidadeAr.indice ? ` (DEFRA ${qualidadeAr.indice}/10)` : ""),
        14,
        34,
    );

    if (qualidadeAr.poluentes.length > 0) {
        doc.text(
            "Poluentes (µg/m³): " +
                qualidadeAr.poluentes.map((p) => `${p.nome} ${p.valor.toFixed(1)}`).join("   "),
            14,
            39,
        );
    }

    autoTable(doc, {
        startY: 44,
        head: [["Horário", "Condição", "Chuva", "Temperatura", "Sensação", "Umidade", "Vento"]],
        body: horas.map((h) => [
            h.hora,
            h.condicao,
            `${h.chuva}%`,
            `${h.temperatura}°C`,
            `${h.sensacao}°C`,
            `${h.umidade}%`,
            `${h.vento} km/h`,
        ]),
        styles: { font: "helvetica", fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [37, 99, 235], textColor: 255, halign: "center" },
        bodyStyles: { halign: "center" },
        columnStyles: { 1: { halign: "left" } },
        alternateRowStyles: { fillColor: [246, 248, 252] },
        didDrawPage: () => {
            doc.setFontSize(8);
            doc.setTextColor(120);
            doc.text("Fontes: IBGE (municípios) e WeatherAPI (previsão)", 14, altura - 8);
            doc.text(`Página ${doc.getNumberOfPages()}`, largura - 14, altura - 8, { align: "right" });
            doc.setTextColor(0);
        },
    });

    const slug = cidade
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase();

    doc.save(`relatorio-climatico-${slug}-${coletadoEm.toISOString().slice(0, 10)}.pdf`);
}
