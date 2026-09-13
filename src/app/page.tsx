import { listUfs } from "@/lib/candidatos";
import { VotoForm } from "@/components/voto-form";
import { TermoExplicado } from "@/components/termo-explicado";

export default async function Home() {
  const ufs = await listUfs();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 py-16 sm:px-10">
      <header className="border-b border-line pb-8">
        <p className="font-heading text-xs uppercase tracking-[0.3em] text-ink-muted">
          Eleições 2026
        </p>
        <h1 className="mt-3 font-heading text-4xl leading-tight sm:text-5xl">
          Para quem vai o seu voto
        </h1>
        <p className="mt-4 max-w-2xl text-ink-muted">
          Quando você vota em uma candidata/o, o seu voto ajuda a eleger todas as outras
          candidatas/os da{" "}
          <TermoExplicado
            termo="federação"
            explicacao="Federação partidária: união de dois ou mais partidos que passam a atuar como uma única legenda nas eleições, por pelo menos 4 anos. Os votos de todas as candidatas e candidatos da federação, de todos os partidos que a compõem, são somados para calcular quantas vagas a federação conquista — por isso seu voto também ajuda colegas de outros partidos dentro da mesma federação."
          />{" "}
          daquele partido.
        </p>
        <p className="mt-3 max-w-2xl text-sm text-ink-muted">
          Escolha seu estado e busque a candidata/o a deputada/o federal ou estadual em quem
          pretende votar para ver a federação (ou, quando o partido não integra nenhuma, o próprio
          partido) e as demais pessoas beneficiadas pelo seu voto. Dados oficiais do{" "}
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
        <p>
          Fonte dos dados: TSE — Sistema CAND/Candex, conjunto &quot;Candidatos - 2026&quot;. Este
          projeto não é afiliado ao TSE.
        </p>
        <p className="mt-2">
          Projeto de código aberto —{" "}
          <a
            href="https://github.com/filafb/meu_voto"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-ink"
          >
            veja o código no GitHub
          </a>
          .
        </p>
        <p className="mt-2">
          Não usamos cookies nem coletamos dados pessoais de quem visita. Guardamos apenas
          contagens anônimas e agregadas (visitas às páginas e quantas vezes cada candidata/o foi
          buscada/o), sem nenhuma informação que identifique você.
        </p>
      </footer>
    </main>
  );
}
