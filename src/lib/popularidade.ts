import { unstable_cache } from "next/cache";
import { Redis } from "@upstash/redis";

// Ordena a lista de candidatos exibida por relevância: primeiro por quantas
// vezes foi escolhida no autocomplete do app (sorted set por UF no Upstash
// Redis — integração "Redis" do Vercel Marketplace); em empate, por votos
// recebidos na eleição de 2022. O critério de votos funciona mesmo sem
// Redis configurado (fica sendo o único critério nesse caso); a busca por
// popularidade vira no-op sem as variáveis de ambiente — funciona
// normalmente em desenvolvimento local sem Redis.
//
// O placar completo por UF é lido do Redis no máximo uma vez a cada
// REVALIDATE_SEGUNDOS (via unstable_cache), em vez de uma leitura por busca
// digitada — sem isso, cada tecla do autocomplete gastaria um comando do
// plano gratuito do Upstash. Só a escrita (seleção de candidata/o) é
// imediata; a ordenação por popularidade pode ficar até esse tempo
// desatualizada, o que é aceitável para esse caso de uso.

const REVALIDATE_SEGUNDOS = 300;

// A integração "Redis" do Vercel Marketplace pode injetar as variáveis com
// nomes diferentes dependendo do provedor/fluxo (ex.: KV_REST_API_URL/TOKEN,
// nomenclatura legada do antigo Vercel KV, em vez de
// UPSTASH_REDIS_REST_URL/TOKEN) — por isso aceitamos as duas.
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

const redis = REDIS_URL && REDIS_TOKEN ? new Redis({ url: REDIS_URL, token: REDIS_TOKEN }) : null;

function chave(uf: string) {
  return `popularidade:${uf.toUpperCase()}`;
}

export async function registrarSelecao(uf: string, sq: string): Promise<void> {
  if (!redis) return;
  try {
    await redis.zincrby(chave(uf), 1, sq);
  } catch {
    // Falha ao registrar não deve quebrar a experiência do usuário.
  }
}

async function buscarPlacarCompleto(uf: string): Promise<Record<string, number>> {
  if (!redis) return {};
  try {
    const bruto = await redis.zrange<(string | number)[]>(chave(uf), 0, -1, {
      withScores: true,
    });
    const placar: Record<string, number> = {};
    for (let i = 0; i < bruto.length; i += 2) {
      placar[String(bruto[i])] = Number(bruto[i + 1]);
    }
    return placar;
  } catch {
    return {};
  }
}

const getPlacarCacheado = unstable_cache(buscarPlacarCompleto, ["popularidade-placar"], {
  revalidate: REVALIDATE_SEGUNDOS,
});

/** Reordena `itens`: mais buscadas/os no app primeiro (placar em cache por
 * até alguns minutos); em empate (inclusive sem Redis configurado), mais
 * votadas/os em 2022 primeiro. */
export async function ordenarPorRelevancia<
  T extends { sq: string; votos2022: number | null },
>(uf: string, itens: T[]): Promise<T[]> {
  if (itens.length === 0) return itens;

  const placar = redis ? await getPlacarCacheado(uf) : {};

  return itens
    .map((item) => ({ item, pop: placar[item.sq] ?? 0 }))
    .sort((a, b) => b.pop - a.pop || (b.item.votos2022 ?? 0) - (a.item.votos2022 ?? 0))
    .map((x) => x.item);
}
