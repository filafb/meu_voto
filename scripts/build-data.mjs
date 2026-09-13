// One-off build script: converts raw TSE "consulta_cand_2026_<UF>.csv" and
// "consulta_cand_complementar_2026_<UF>.csv" files (data/raw/, ISO-8859-1,
// ';'-delimited) into compact per-UF JSON files consumed by the app
// (public/data/candidatos-<uf>.json). Not run at request time.
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import iconv from "iconv-lite";
import { parse } from "csv-parse/sync";

const RAW_DIR = join(process.cwd(), "data", "raw");
const OUT_DIR = join(process.cwd(), "public", "data");
const VOTOS2022_PATH = join(process.cwd(), "data", "votos2022.json");
mkdirSync(OUT_DIR, { recursive: true });

// SQ_CANDIDATO (2026) -> votos recebidos em 2022 (ver scripts/build-votos2022.mjs)
const votos2022PorSq = existsSync(VOTOS2022_PATH)
  ? JSON.parse(readFileSync(VOTOS2022_PATH, "utf-8"))
  : {};

const CARGOS = new Set(["DEPUTADO FEDERAL", "DEPUTADO ESTADUAL"]);

function readCsv(fileName) {
  const buf = readFileSync(join(RAW_DIR, fileName));
  const text = iconv.decode(buf, "iso-8859-1");
  return parse(text, { columns: true, delimiter: ";", quote: '"', skip_empty_lines: true });
}

const arquivos = readdirSync(RAW_DIR).filter((f) => f.endsWith(".csv"));
const arquivosPrincipais = arquivos.filter(
  (f) => f.startsWith("consulta_cand_2026_") && f.length === "consulta_cand_2026_XX.csv".length
);
const arquivosComplementares = arquivos.filter((f) => f.startsWith("consulta_cand_complementar_2026_"));
const arquivosBens = arquivos.filter((f) => f.startsWith("bem_candidato_2026_"));

// SQ_CANDIDATO -> informações complementares
const complementarPorSq = new Map();
for (const file of arquivosComplementares) {
  for (const row of readCsv(file)) {
    complementarPorSq.set(row.SQ_CANDIDATO, {
      idade: row.NR_IDADE_DATA_POSSE ? Number(row.NR_IDADE_DATA_POSSE) : null,
      municipioNascimento: row.NM_MUNICIPIO_NASCIMENTO || null,
    });
  }
}

// SQ_CANDIDATO -> soma do patrimônio declarado (bens de candidatos)
const patrimonioPorSq = new Map();
for (const file of arquivosBens) {
  for (const row of readCsv(file)) {
    const valor = Number(row.VR_BEM_CANDIDATO.replace(",", "."));
    if (!Number.isFinite(valor)) continue;
    patrimonioPorSq.set(row.SQ_CANDIDATO, (patrimonioPorSq.get(row.SQ_CANDIDATO) ?? 0) + valor);
  }
}

let totalCandidatos = 0;
const byUf = new Map(); // uf -> candidato[]

for (const file of arquivosPrincipais) {
  const rows = readCsv(file);

  for (const row of rows) {
    const cargo = row.DS_CARGO;
    if (!CARGOS.has(cargo)) continue;

    const uf = row.SG_UF;
    const nrFederacao = Number(row.NR_FEDERACAO);
    const temFederacao = Number.isFinite(nrFederacao) && nrFederacao > 0;
    const complementar = complementarPorSq.get(row.SQ_CANDIDATO) ?? {};

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
      genero: row.DS_GENERO || null,
      corRaca: row.DS_COR_RACA || null,
      grauInstrucao: row.DS_GRAU_INSTRUCAO || null,
      estadoCivil: row.DS_ESTADO_CIVIL || null,
      ocupacao: row.DS_OCUPACAO || null,
      ufNascimento: row.SG_UF_NASCIMENTO || null,
      municipioNascimento: complementar.municipioNascimento ?? null,
      idade: complementar.idade ?? null,
      patrimonio: patrimonioPorSq.get(row.SQ_CANDIDATO) ?? null,
      votos2022: votos2022PorSq[row.SQ_CANDIDATO] ?? null,
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
