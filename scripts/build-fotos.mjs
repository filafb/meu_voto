// One-off build script: copies only the candidate photos we actually use
// (deputada/o federal e estadual, from public/data/candidatos-<UF>.json) out
// of the raw TSE photo dumps into public/fotos/<SQ_CANDIDATO>.jpg.
//
// Raw photos come from https://dadosabertos.tse.jus.br/dataset/candidatos-2026
// ("<UF> - Fotos de candidatos"), one zip per UF at
// https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2026/fotos/foto_cand2026_<UF>_div.zip
// extracted (per UF) into FOTOS_RAW_DIR before running this script. Filenames
// inside follow the pattern F<UF><SQ_CANDIDATO>_div.jpg.
import { readFileSync, readdirSync, mkdirSync, copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const DATA_DIR = join(process.cwd(), "public", "data");
const FOTOS_RAW_DIR = process.env.FOTOS_RAW_DIR;
const OUT_DIR = join(process.cwd(), "public", "fotos");

if (!FOTOS_RAW_DIR || !existsSync(FOTOS_RAW_DIR)) {
  console.error("Defina FOTOS_RAW_DIR apontando para a pasta com uma subpasta por UF (extraída dos zips de fotos do TSE).");
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

const ufs = JSON.parse(readFileSync(join(DATA_DIR, "ufs.json"), "utf-8"));

let copiadas = 0;
let semFoto = 0;

for (const uf of ufs) {
  const candidatos = JSON.parse(readFileSync(join(DATA_DIR, `candidatos-${uf}.json`), "utf-8"));
  const rawUfDir = join(FOTOS_RAW_DIR, uf);
  if (!existsSync(rawUfDir)) {
    console.warn(`Sem pasta de fotos para ${uf}, pulando.`);
    semFoto += candidatos.length;
    continue;
  }

  const arquivos = new Set(readdirSync(rawUfDir));

  for (const c of candidatos) {
    const nomeArquivo = `F${uf}${c.sq}_div.jpg`;
    if (!arquivos.has(nomeArquivo)) {
      semFoto++;
      continue;
    }
    copyFileSync(join(rawUfDir, nomeArquivo), join(OUT_DIR, `${c.sq}.jpg`));
    copiadas++;
  }
}

console.log(`Fotos copiadas: ${copiadas}. Sem foto disponível: ${semFoto}.`);
