// One-off build script: converts raw TSE "consulta_cand_2026_<UF>.csv" files
// (data/raw/, ISO-8859-1, ';'-delimited) into compact per-UF JSON files
// consumed by the app (public/data/candidatos-<uf>.json). Not run at request time.
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import iconv from "iconv-lite";
import { parse } from "csv-parse/sync";

const RAW_DIR = join(process.cwd(), "data", "raw");
const OUT_DIR = join(process.cwd(), "public", "data");
mkdirSync(OUT_DIR, { recursive: true });

const CARGOS = new Set(["DEPUTADO FEDERAL", "DEPUTADO ESTADUAL"]);

const files = readdirSync(RAW_DIR).filter((f) => f.endsWith(".csv"));

let totalCandidatos = 0;
const byUf = new Map(); // uf -> candidato[]

for (const file of files) {
  const buf = readFileSync(join(RAW_DIR, file));
  const text = iconv.decode(buf, "iso-8859-1");
  const rows = parse(text, {
    columns: true,
    delimiter: ";",
    quote: '"',
    skip_empty_lines: true,
  });

  for (const row of rows) {
    const cargo = row.DS_CARGO;
    if (!CARGOS.has(cargo)) continue;

    const uf = row.SG_UF;
    const nrFederacao = Number(row.NR_FEDERACAO);
    const temFederacao = Number.isFinite(nrFederacao) && nrFederacao > 0;

    const candidato = {
      sq: row.SQ_CANDIDATO,
      numero: row.NR_CANDIDATO,
      nome: row.NM_CANDIDATO,
      nomeUrna: row.NM_URNA_CANDIDATO,
      partidoSigla: row.SG_PARTIDO,
      partidoNumero: row.NR_PARTIDO,
      partidoNome: row.NM_PARTIDO,
      cargo: cargo === "DEPUTADO FEDERAL" ? "federal" : "estadual",
      uf,
      federacaoNr: temFederacao ? nrFederacao : null,
      federacaoSigla: temFederacao ? row.SG_FEDERACAO : null,
      federacaoNome: temFederacao ? row.NM_FEDERACAO : null,
      federacaoComposicao: temFederacao ? row.DS_COMPOSICAO_FEDERACAO : null,
    };

    if (!byUf.has(uf)) byUf.set(uf, []);
    byUf.get(uf).push(candidato);
    totalCandidatos++;
  }
}

const ufs = [...byUf.keys()].sort();
for (const uf of ufs) {
  const outPath = join(OUT_DIR, `candidatos-${uf}.json`);
  writeFileSync(outPath, JSON.stringify(byUf.get(uf)));
}
writeFileSync(join(OUT_DIR, "ufs.json"), JSON.stringify(ufs));

console.log(`Processados ${totalCandidatos} candidatos (deputado federal/estadual) em ${ufs.length} UFs.`);
