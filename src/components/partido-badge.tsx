function corParaSigla(sigla: string) {
  let hash = 0;
  for (let i = 0; i < sigla.length; i++) hash = (hash * 31 + sigla.charCodeAt(i)) >>> 0;
  const hue = hash % 360;
  return `hsl(${hue} 45% 30%)`;
}

export function PartidoBadge({ sigla }: { sigla: string }) {
  return (
    <span className="flex items-center gap-2 border border-line bg-card py-1 pl-1 pr-2.5">
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center text-[10px] font-bold text-paper"
        style={{ backgroundColor: corParaSigla(sigla) }}
      >
        {sigla.replace(/[^A-Z0-9]/gi, "").slice(0, 2).toUpperCase()}
      </span>
      <span className="text-xs font-medium tracking-wide">{sigla}</span>
    </span>
  );
}
