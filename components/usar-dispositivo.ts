"use client";

import { useEffect, useState } from "react";

/**
 * Decide se vale renderizar a cena 3D. Além do tamanho da tela, checa memória
 * e núcleos disponíveis: um celular intermediário roda o React Three Fiber,
 * mas às custas de travamento e bateria — o fallback estático é melhor ali.
 *
 * O nome precisa começar com `use`: é assim que o ESLint reconhece um hook e
 * consegue validar as regras de hooks. Só o restante fica em português.
 */
export function useCena3dPermitida() {
    const [permitida, setPermitida] = useState(false);

    useEffect(() => {
        /* `matchMedia` avisa na mudança da propria condicao. O evento `resize`
           sozinho perde casos como rotacao de tela em parte dos navegadores. */
        const tamanho = window.matchMedia("(min-width: 1024px)");
        const movimento = window.matchMedia("(prefers-reduced-motion: reduce)");

        function avaliar() {
            const nav = navigator as Navigator & { deviceMemory?: number };
            const memoriaOk = (nav.deviceMemory ?? 8) >= 4;
            const nucleosOk = (navigator.hardwareConcurrency ?? 8) >= 4;

            setPermitida(tamanho.matches && !movimento.matches && memoriaOk && nucleosOk);
        }

        avaliar();
        tamanho.addEventListener("change", avaliar);
        movimento.addEventListener("change", avaliar);

        return () => {
            tamanho.removeEventListener("change", avaliar);
            movimento.removeEventListener("change", avaliar);
        };
    }, []);

    return permitida;
}
