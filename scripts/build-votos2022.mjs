// One-off build script: computes total votes received in the 2022 election
// for each 2026 candidate who also ran in 2022 in the same UF, matched by
// CPF (used only as an internal join key — never stored or shipped).
//
// Inputs (env vars, both point to folders of extracted per-UF CSVs):
//   CAND2022_RAW_DIR  -> consulta_cand_2022_<UF>.csv
//     (https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_2022.zip)
//   VOTACAO_RAW_DIR   -> votacao_candidato_munzona_2022_<UF>.csv
//     (https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_candidato_munzona/votacao_candidato_munzona_2022.zip)
//
// Output: data/votos2022.json — { "<SQ_CANDIDATO_2026>": totalVotos }
// (only candidates with a CPF match get an entry). build-data.mjs reads this
// file to fill Candidato.votos2022.
//
// The votação files are huge (hundreds of MB to >1GB per UF), so they're
// streamed line-by-line and filtered early against a small per-UF set of
// "relevant" 2022 SQ_CANDIDATO values, instead of being parsed in full.
import { readFileSync, readdirSync, writeFileSync, existsSync, createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { join } from "node:path";
import iconv from "iconv-lite";
import { parse } from "csv-parse/sync";

const RAW_DIR = join(process.cwd(), "data", "raw");
const DATA_DIR = join(process.cwd(), "public", "data");
const OUT_PATH = join(process.cwd(), "data", "votos2022.json");

const CAND2022_DIR = process.env.CAND2022_RAW_DIR;
const VOTACAO_DIR = process.env.VOTACAO_RAW_DIR;

if (!CAND2022_DIR || !VOTACAO_DIR || !existsSync(CAND2022_DIR) || !existsSync(VOTACAO_DIR)) {
  console.error(
    "Defina CAND2022_RAW_DIR e VOTACAO_RAW_DIR apontando para as pastas com os CSVs extraídos por UF."
  );
  process.exit(1);
}

const CARGOS = new Set(["DEPUTADO FEDERAL", "DEPUTADO ESTADUAL"]);

function readCsvSync(path) {
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

const arquivosPrincipais2026 = readdirSync(RAW_DIR).filter(
  (f) => f.startsWith("consulta_cand_2026_") && f.length === "consulta_cand_2026_XX.csv".length
);

const resultado = {}; // sq2026 -> votos2022
let ufsProcessadas = 0;

for (const file of arquivosPrincipais2026) {
  const uf = file.match(/consulta_cand_2026_(\w\w)\.csv/)[1];

  const candidatos2026 = readCsvSync(join(RAW_DIR, file)).filter((r) => CARGOS.has(r.DS_CARGO));
  if (candidatos2026.length === 0) continue;

  const arquivo2022 = join(CAND2022_DIR, `consulta_cand_2022_${uf}.csv`);
  if (!existsSync(arquivo2022)) {
    console.warn(`Sem candidatos 2022 para ${uf}, pulando.`);
    continue;
  }

  // CPF (2022) -> SQ_CANDIDATO (2022)
  const sq2022PorCpf = new Map();
  for (const row of readCsvSync(arquivo2022)) {
    if (row.NR_CPF_CANDIDATO) sq2022PorCpf.set(row.NR_CPF_CANDIDATO, row.SQ_CANDIDATO);
  }

  // SQ_CANDIDATO (2026) -> SQ_CANDIDATO (2022), só para quem casou por CPF
  const sq2022PorSq2026 = new Map();
  for (const row of candidatos2026) {
    const sq2022 = row.NR_CPF_CANDIDATO ? sq2022PorCpf.get(row.NR_CPF_CANDIDATO) : undefined;
    if (sq2022) sq2022PorSq2026.set(row.SQ_CANDIDATO, sq2022);
  }

  const sqsRelevantes = new Set(sq2022PorSq2026.values());
  console.log(
    `${uf}: ${candidatos2026.length} candidatas/os 2026, ${sqsRelevantes.size} com correspondência em 2022`
  );

  const votosPorSq2022 = await votosPorSqNaUf(uf, sqsRelevantes);

  for (const [sq2026, sq2022] of sq2022PorSq2026) {
    const votos = votosPorSq2022.get(sq2022);
    if (votos !== undefined) resultado[sq2026] = votos;
  }

  ufsProcessadas++;
}

writeFileSync(OUT_PATH, JSON.stringify(resultado));
console.log(
  `Pronto. ${Object.keys(resultado).length} candidatas/os com votos de 2022 encontrados, em ${ufsProcessadas} UFs. Salvo em ${OUT_PATH}.`
);
