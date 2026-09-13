// One-off build script: extracts currently serving deputies (elected in the
// 2022 election, "ELEITO POR QP"/"ELEITO POR MÉDIA") from the TSE 2022
// candidates dataset, per UF, along with the votes each received — used to
// show voters who currently holds office for the parties in a federação
// (sorted by votes), independent of whether that person is running again in
// 2026.
//
// Input (env vars, folders of extracted per-UF CSVs):
//   CAND2022_RAW_DIR -> consulta_cand_2022_<UF>.csv
//     (https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_2022.zip)
//   VOTACAO_RAW_DIR  -> votacao_candidato_munzona_2022_<UF>.csv
//     (https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_candidato_munzona/votacao_candidato_munzona_2022.zip)
//
// Output: public/data/atuais-<UF>.json — array of currently elected
// deputies (federal + estadual) for that UF, sorted by votes desc. This
// data never changes (2022 election is over), so this script normally only
// needs to run once.
import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync, createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { join } from "node:path";
import iconv from "iconv-lite";
import { parse } from "csv-parse/sync";

const CAND2022_DIR = process.env.CAND2022_RAW_DIR;
const VOTACAO_DIR = process.env.VOTACAO_RAW_DIR;
const OUT_DIR = join(process.cwd(), "public", "data");

if (!CAND2022_DIR || !VOTACAO_DIR || !existsSync(CAND2022_DIR) || !existsSync(VOTACAO_DIR)) {
  console.error(
    "Defina CAND2022_RAW_DIR e VOTACAO_RAW_DIR apontando para as pastas com os CSVs extraídos por UF."
  );
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

const CARGOS = new Set(["DEPUTADO FEDERAL", "DEPUTADO ESTADUAL"]);
const SITUACOES_ELEITO = new Set(["ELEITO POR QP", "ELEITO POR MÉDIA", "ELEITO"]);

function readCsv(path) {
  const buf = readFileSync(path);
  const text = iconv.decode(buf, "iso-8859-1");
  return parse(text, { columns: true, delimiter: ";", quote: '"', skip_empty_lines: true });
}

function limpar(campo) {
  return campo.replace(/^"|"$/g, "");
}

async function votosPorSqNaUf(uf, sqsRelevantes) {
  const totais = new Map();
  if (sqsRelevantes.size === 0) return totais;

  const caminho = join(VOTACAO_DIR, `votacao_candidato_munzona_2022_${uf}.csv`);
  if (!existsSync(caminho)) {
    console.warn(`Sem arquivo de votação para ${uf}, pulando.`);
    return totais;
  }

  const rl = createInterface({
    input: createReadStream(caminho).pipe(iconv.decodeStream("iso-8859-1")),
    crlfDelay: Infinity,
  });

  let idxSq = -1;
  let idxVotos = -1;
  let primeira = true;

  for await (const linha of rl) {
    if (!linha) continue;
    const campos = linha.split(";");
    if (primeira) {
      idxSq = campos.findIndex((c) => limpar(c) === "SQ_CANDIDATO");
      idxVotos = campos.findIndex((c) => limpar(c) === "QT_VOTOS_NOMINAIS_VALIDOS");
      primeira = false;
      continue;
    }
    const sq = limpar(campos[idxSq]);
    if (!sqsRelevantes.has(sq)) continue;
    const votos = Number(limpar(campos[idxVotos]));
    if (!Number.isFinite(votos)) continue;
    totais.set(sq, (totais.get(sq) ?? 0) + votos);
  }

  return totais;
}

const arquivos = readdirSync(CAND2022_DIR).filter(
  (f) => f.startsWith("consulta_cand_2022_") && f.length === "consulta_cand_2022_XX.csv".length
);

let totalEleitos = 0;

for (const file of arquivos) {
  const uf = file.match(/consulta_cand_2022_(\w\w)\.csv/)[1];
  const rows = readCsv(join(CAND2022_DIR, file));

  const eleitosBrutos = rows.filter(
    (r) => CARGOS.has(r.DS_CARGO) && SITUACOES_ELEITO.has(r.DS_SIT_TOT_TURNO)
  );
  if (eleitosBrutos.length === 0) continue;

  const votosPorSq = await votosPorSqNaUf(uf, new Set(eleitosBrutos.map((r) => r.SQ_CANDIDATO)));

  const eleitos = eleitosBrutos
    .map((r) => ({
      sq: r.SQ_CANDIDATO,
      numero: r.NR_CANDIDATO,
      nome: r.NM_CANDIDATO,
      nomeUrna: r.NM_URNA_CANDIDATO,
      partidoSigla: r.SG_PARTIDO,
      partidoNome: r.NM_PARTIDO,
      cargo: r.DS_CARGO === "DEPUTADO FEDERAL" ? "federal" : "estadual",
      uf,
      votos2022: votosPorSq.get(r.SQ_CANDIDATO) ?? null,
    }))
    .sort((a, b) => (b.votos2022 ?? 0) - (a.votos2022 ?? 0));

  writeFileSync(join(OUT_DIR, `atuais-${uf}.json`), JSON.stringify(eleitos));
  totalEleitos += eleitos.length;
  console.log(`${uf}: ${eleitos.length} deputadas/os atuais`);
}

console.log(`Pronto. ${totalEleitos} deputadas/os atuais (eleitas/os em 2022) em ${arquivos.length} UFs.`);
