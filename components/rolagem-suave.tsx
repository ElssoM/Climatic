"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Lenis controla a rolagem da página inteira. Fica desativado quando a pessoa
 * pediu menos movimento no sistema — nesse caso a rolagem nativa é a correta.
 */
export function RolagemSuave() {
    useEffect(() => {
        const querMenosMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (querMenosMovimento) return;

        const lenis = new Lenis({
            duration: 1.1,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
        });

        let frame = 0;
        function animar(tempo: number) {
            lenis.raf(tempo);
            frame = requestAnimationFrame(animar);
        }
        frame = requestAnimationFrame(animar);

        return () => {
            cancelAnimationFrame(frame);
            lenis.destroy();
        };
    }, []);

    return null;
}
