"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Candidato } from "@/lib/candidatos";
import { CandidatoOrb, ORB_LARGURA, ORB_ALTURA } from "./candidato-orb";

const RAIO = 210;
const SENSIBILIDADE = 0.4; // graus por pixel arrastado

function distribuirNaEsfera(n: number, raio: number) {
  const pontos: { x: number; y: number; z: number }[] = [];
  if (n <= 0) return pontos;
  const anguloDourado = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = n === 1 ? 0 : 1 - (i / (n - 1)) * 2;
    const raioNoY = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = anguloDourado * i;
    pontos.push({
      x: Math.cos(theta) * raioNoY * raio,
      y: y * raio,
      z: Math.sin(theta) * raioNoY * raio,
    });
  }
  return pontos;
}

export function FederacaoGlobo({ membros }: { membros: Candidato[] }) {
  const pontos = useMemo(() => distribuirNaEsfera(membros.length, RAIO), [membros.length]);
  const grupoRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const anguloRef = useRef(0);
  const arrastandoRef = useRef(false);
  const ultimoYRef = useRef(0);

  useEffect(() => {
    function renderizar() {
      const angulo = anguloRef.current;
      const rad = (angulo * Math.PI) / 180;
      const sin = Math.sin(rad);
      const cos = Math.cos(rad);

      if (grupoRef.current) {
        grupoRef.current.style.transform = `rotateY(${angulo}deg)`;
      }

      pontos.forEach((p, i) => {
        const el = cardRefs.current[i];
        if (!el) return;
        // Posição já rotacionada em torno do eixo Y (o grupo pai gira, o card
        // é traduzido dentro desse espaço já rotacionado) — aqui só
        // calculamos a profundidade aparente para dar a sensação de esfera.
        const zRotacionado = p.x * sin + p.z * cos;
        const profundidade = (zRotacionado + RAIO) / (2 * RAIO); // 0 (fundo) .. 1 (frente)
        el.style.transform = `translate3d(${p.x}px, ${p.y}px, ${p.z}px) rotateY(${-angulo}deg) translate(-50%, -50%)`;
        el.style.opacity = String(0.3 + profundidade * 0.7);
        el.style.zIndex = String(Math.round(zRotacionado + RAIO));
      });
    }

    renderizar();

    function onPointerMove(e: PointerEvent) {
      if (!arrastandoRef.current) return;
      const deltaY = e.clientY - ultimoYRef.current;
      ultimoYRef.current = e.clientY;
      anguloRef.current = (anguloRef.current + deltaY * SENSIBILIDADE) % 360;
      renderizar();
    }

    function onPointerUp() {
      arrastandoRef.current = false;
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [pontos]);

  if (membros.length === 0) return null;

  return (
    <div
      className="relative mx-auto w-full touch-none select-none overflow-hidden"
      style={{ height: RAIO * 2 + ORB_ALTURA, perspective: 1200, cursor: "ns-resize" }}
      onPointerDown={(e) => {
        arrastandoRef.current = true;
        ultimoYRef.current = e.clientY;
      }}
    >
      <div
        ref={grupoRef}
        className="absolute left-1/2 top-1/2"
        style={{ transformStyle: "preserve-3d", width: ORB_LARGURA, height: ORB_ALTURA }}
      >
        {membros.map((m, i) => (
          <div
            key={m.sq}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="absolute left-0 top-0"
            style={{ transformStyle: "preserve-3d" }}
          >
            <CandidatoOrb candidato={m} />
          </div>
        ))}
      </div>
      <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-ink-muted">
        arraste para cima ou para baixo para girar
      </p>
    </div>
  );
}
