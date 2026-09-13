import { listUfs } from "@/lib/candidatos";
import { VotoForm } from "@/components/voto-form";

export default async function Home() {
  const ufs = await listUfs();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 py-16 sm:px-10">
      <header className="border-b border-line pb-8">
        <p className="font-heading text-xs uppercase tracking-[0.3em] text-ink-muted">
          Eleições 2026
        </p>
        <h1 className="mt-3 font-heading text-4xl leading-tight sm:text-5xl">
          Para onde vai o seu voto
        </h1>
        <p className="mt-4 max-w-2xl text-ink-muted">
          Escolha seu estado e os candidatos a deputado federal e estadual em quem pretende votar.
          Mostramos a federação partidária de cada um e todos os outros candidatos que integram a
          mesma federação no seu estado. Dados oficiais do{" "}
          <a
            href="https://dadosabertos.tse.jus.br/dataset/candidatos-2026"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-ink"
          >
            Portal de Dados Abertos do TSE
          </a>
          .
        </p>
      </header>

      <VotoForm ufs={ufs} />

      <footer className="mt-auto border-t border-line pt-6 text-xs text-ink-muted">
        Fonte dos dados: TSE — Sistema CAND/Candex, conjunto &quot;Candidatos - 2026&quot;. Este
        projeto não é afiliado ao TSE.
      </footer>
    </main>
  );
}
