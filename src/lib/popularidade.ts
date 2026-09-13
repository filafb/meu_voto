import { Redis } from "@upstash/redis";

// Ordena a lista de candidatos exibida por popularidade (quantas vezes foi
// escolhida no autocomplete), usando um sorted set por UF no Upstash Redis
// (integração "Redis" do Vercel Marketplace). Sem as variáveis de ambiente
// configuradas, tudo aqui vira no-op e a ordenação original é mantida —
// funciona normalmente em desenvolvimento local sem Redis configurado.

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

/** Reordena `itens` (mais buscados primeiro) sem alterar a ordem relativa
 * de quem tem a mesma popularidade (inclusive zero). */
export async function ordenarPorPopularidade<T extends { sq: string }>(
  uf: string,
  itens: T[]
): Promise<T[]> {
  if (!redis || itens.length === 0) return itens;
  try {
    const scores = await redis.zmscore(
      chave(uf),
      itens.map((i) => i.sq)
    );
    return itens
      .map((item, i) => ({ item, score: scores?.[i] ?? 0 }))
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .map((x) => x.item);
  } catch {
    return itens;
  }
}
