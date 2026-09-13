// One-off build script: extracts currently serving deputies (elected in the
// 2022 election, "ELEITO POR QP"/"ELEITO POR MÉDIA") from the TSE 2022
// candidates dataset, per UF. Used to show voters who currently holds office
// for the parties in a federação — independent of whether that person is
// running again in 2026.
//
// Input (env var, folder of extracted per-UF CSVs):
//   CAND2022_RAW_DIR -> consulta_cand_2022_<UF>.csv
//     (https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_2022.zip)
//
// Output: public/data/atuais-<UF>.json — array of currently elected
// deputies (federal + estadual) for that UF. This data never changes (2022
// election is over), so this script normally only needs to run once.
import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import iconv from "iconv-lite";
import { parse } from "csv-parse/sync";

const CAND2022_DIR = process.env.CAND2022_RAW_DIR;
const OUT_DIR = join(process.cwd(), "public", "data");

if (!CAND2022_DIR || !existsSync(CAND2022_DIR)) {
  console.error("Defina CAND2022_RAW_DIR apontando para a pasta com os consulta_cand_2022_<UF>.csv extraídos.");
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

const arquivos = readdirSync(CAND2022_DIR).filter(
  (f) => f.startsWith("consulta_cand_2022_") && f.length === "consulta_cand_2022_XX.csv".length
);

let totalEleitos = 0;

for (const file of arquivos) {
  const uf = file.match(/consulta_cand_2022_(\w\w)\.csv/)[1];
  const rows = readCsv(join(CAND2022_DIR, file));

  const eleitos = rows
    .filter((r) => CARGOS.has(r.DS_CARGO) && SITUACOES_ELEITO.has(r.DS_SIT_TOT_TURNO))
    .map((r) => ({
      sq: r.SQ_CANDIDATO,
      numero: r.NR_CANDIDATO,
      nome: r.NM_CANDIDATO,
      nomeUrna: r.NM_URNA_CANDIDATO,
      partidoSigla: r.SG_PARTIDO,
      partidoNome: r.NM_PARTIDO,
      cargo: r.DS_CARGO === "DEPUTADO FEDERAL" ? "federal" : "estadual",
      uf,
    }))
    .sort((a, b) => a.partidoSigla.localeCompare(b.partidoSigla) || a.nomeUrna.localeCompare(b.nomeUrna));

  writeFileSync(join(OUT_DIR, `atuais-${uf}.json`), JSON.stringify(eleitos));
  totalEleitos += eleitos.length;
}

console.log(`Pronto. ${totalEleitos} deputadas/os atuais (eleitas/os em 2022) em ${arquivos.length} UFs.`);
