import { Redis } from "@upstash/redis";

// Ordena a lista de candidatos exibida por relevância: primeiro por quantas
// vezes foi escolhida no autocomplete do app (sorted set por UF no Upstash
// Redis — integração "Redis" do Vercel Marketplace); em empate, por votos
// recebidos na eleição de 2022. O critério de votos funciona mesmo sem
// Redis configurado (fica sendo o único critério nesse caso); a busca por
// popularidade vira no-op sem as variáveis de ambiente — funciona
// normalmente em desenvolvimento local sem Redis.

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

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

/** Reordena `itens`: mais buscadas/os no app primeiro; em empate (inclusive
 * quando não há Redis configurado), mais votadas/os em 2022 primeiro. */
export async function ordenarPorRelevancia<
  T extends { sq: string; votos2022: number | null },
>(uf: string, itens: T[]): Promise<T[]> {
  if (itens.length === 0) return itens;

  let popularidade: number[] = itens.map(() => 0);
  if (redis) {
    try {
      const scores = await redis.zmscore(
        chave(uf),
        itens.map((i) => i.sq)
      );
      popularidade = itens.map((_, i) => scores?.[i] ?? 0);
    } catch {
      // segue com popularidade zerada para todas/os em caso de falha
    }
  }

  return itens
    .map((item, i) => ({ item, pop: popularidade[i] }))
    .sort((a, b) => b.pop - a.pop || (b.item.votos2022 ?? 0) - (a.item.votos2022 ?? 0))
    .map((x) => x.item);
}
