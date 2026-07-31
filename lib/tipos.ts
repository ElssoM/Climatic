export type Estado = {
    sigla: string;
    nome: string;
};

export type Municipio = {
    nome: string;
};

export type NivelAr = "baixa" | "moderada" | "alta" | "muito-alta" | "indisponivel";

export type QualidadeAr = {
    nivel: NivelAr;
    rotulo: string;
    indice: number | null;
    poluentes: { chave: string; nome: string; valor: number }[];
};

export type HoraPrevisao = {
    hora: string;
    condicao: string;
    chuva: number;
    temperatura: number;
    sensacao: number;
    umidade: number;
    vento: number;
};

export type Previsao = {
    cidade: string;
    estado: string;
    coletadoEm: string;
    horaLocal: number;
    atual: {
        temperatura: number;
        sensacao: number;
        condicao: string;
        umidade: number;
        vento: number;
    };
    qualidadeAr: QualidadeAr;
    horas: HoraPrevisao[];
};
