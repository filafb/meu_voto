# Para quem vai o seu voto

[paraquemvaioseuvoto.com.br](https://paraquemvaioseuvoto.com.br) — descubra a
federação partidária da sua candidata/o a deputada/o federal ou estadual nas
eleições de 2026, e todas/os as/os outras/os candidatas/os que integram a
mesma federação no seu estado.

Dados oficiais do [Portal de Dados Abertos do
TSE](https://dadosabertos.tse.jus.br/dataset/candidatos-2026) (conjunto
"Candidatos - 2026").

## Como funciona

1. O usuário escolhe seu estado e o candidato a deputado federal e/ou estadual
   em quem pretende votar.
2. A aplicação mostra a federação partidária do candidato (quando houver) e
   todos os outros candidatos dessa federação, para o mesmo cargo e estado.

Os dados dos candidatos ficam em `public/data/candidatos-<UF>.json`, gerados a
partir dos CSVs oficiais do TSE (ver [Atualizando os dados](#atualizando-os-dados)).
Não há chamadas ao TSE em tempo de execução — tudo é servido estaticamente pelo
próprio Next.js.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Atualizando os dados

Os dados de candidaturas do TSE são atualizados 4x ao dia até o fim do
processo eleitoral. Importante: o CDN do TSE (`cdn.tse.jus.br`) usa Akamai Bot
Manager e bloqueia clientes não-navegador (curl, wget, scripts) com 403,
mesmo a partir de um IP residencial brasileiro válido — os downloads abaixo
só funcionam por um navegador de verdade.

**Candidatos, informações complementares e bens** (nome, partido, federação,
idade, patrimônio declarado, etc.):

1. Baixe, pelo navegador:
   - <https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_2026.zip>
   - <https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand_complementar/consulta_cand_complementar_2026.zip>
   - <https://cdn.tse.jus.br/estatistica/sead/odsele/bem_candidato/bem_candidato_2026.zip>
2. Extraia os arquivos `consulta_cand_2026_<UF>.csv`,
   `consulta_cand_complementar_2026_<UF>.csv` e `bem_candidato_2026_<UF>.csv`
   para `data/raw/`.
3. Rode `node scripts/build-data.mjs`, que regenera os arquivos em
   `public/data/` (o patrimônio é a soma de `VR_BEM_CANDIDATO` por candidata/o).

**Votos recebidos em 2022** (usados como critério de desempate na ordenação,
atrás da popularidade de busca — ver seção abaixo):

Só precisa ser refeito se os dados de 2022 mudarem (não mudam mais — eleição
já encerrada), então normalmente não faz parte da atualização de rotina.

1. Baixe, pelo navegador:
   - <https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_2022.zip>
   - <https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_candidato_munzona/votacao_candidato_munzona_2022.zip>
     (⚠️ grande: ~600MB compactado, ~4GB por UF descompactado — baixe só os
     arquivos `votacao_candidato_munzona_2022_<UF>.csv`, ignore o `_BRASIL.csv`
     nacional redundante)
2. Extraia cada um em uma pasta própria.
3. Rode:
   ```bash
   CAND2022_RAW_DIR=<pasta candidatos 2022> \
   VOTACAO_RAW_DIR=<pasta votação 2022> \
   node scripts/build-votos2022.mjs
   ```
   Isso casa candidatas/os de 2026 com suas candidaturas de 2022 pelo CPF
   (usado só como chave de junção — nunca é salvo ou exposto) e soma os votos
   nominais válidos de cada uma/um, gerando `data/votos2022.json` (pequeno,
   sem CPF, só `SQ_CANDIDATO_2026 -> total de votos`). Rode `build-data.mjs`
   de novo depois para incorporar o resultado.

**Deputadas/os atuais** (eleitas/os em 2022, mostradas/os por partido da
federação — quem já foi eleito por aquela legenda, independente de estar
concorrendo em 2026). Também não muda mais; normalmente não faz parte da
atualização de rotina. Reaproveita a pasta `consulta_cand_2022_<UF>.csv` já
baixada para os votos de 2022 acima:

```bash
CAND2022_RAW_DIR=<pasta candidatos 2022> node scripts/build-atuais.mjs
```

Gera `public/data/atuais-<UF>.json` (nome, partido, cargo — sem CPF ou
qualquer outro dado sensível).

**Fotos dos candidatos:**

1. Baixe, pelo navegador, um zip por UF:
   `https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2026/fotos/foto_cand2026_<UF>_div.zip`
2. Extraia cada zip em uma pasta própria por UF, ex.: `<pasta>/<UF>/*.jpg`.
3. Rode `FOTOS_RAW_DIR=<pasta> node scripts/build-fotos.mjs`, que converte
   para WebP e copia só as fotos das/os candidatas/os usadas pelo app para
   `public/fotos/<SQ>.webp`.

Reinicie o servidor de dev depois de regenerar os dados — os arquivos de
`public/data/` ficam em cache de processo enquanto o servidor roda.

## Ordenação por relevância

As listas de candidatas/os (busca e "demais candidatas/os da federação") são
ordenadas por dois critérios, nessa prioridade:

1. Popularidade de busca no próprio app — quantas vezes foi escolhida no
   autocomplete, contado por estado num sorted set do Redis. **Opcional**:
   sem Redis configurado, esse critério não entra (vira empate geral) e a
   ordenação usa só o critério 2.
2. Votos recebidos em 2022 (desempate) — sempre disponível, não depende de
   Redis.

Para ativar na Vercel:

1. No projeto na Vercel, vá em **Storage** → adicione a integração **Redis**
   (Marketplace, provedor Upstash) — isso cria automaticamente as variáveis
   de conexão no projeto. Dependendo do fluxo, elas vêm como
   `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` ou, com a nomenclatura
   legada do Vercel KV, `KV_REST_API_URL`/`KV_REST_API_TOKEN` — o app aceita
   as duas (confira em Settings → Environment Variables qual delas apareceu).
2. Redeploy. Cada seleção de candidata/o no autocomplete incrementa o
   contador dela via `POST /api/candidatos`; as buscas seguintes já saem
   ordenadas por popularidade.

O placar completo de cada UF é lido do Redis (`ZRANGE`) no máximo uma vez a
cada 5 minutos, via `unstable_cache` — não a cada busca digitada — para não
estourar o limite de comandos/mês do plano gratuito do Upstash mesmo com
bastante tráfego. Só o incremento na seleção (`ZINCRBY`) é imediato; a
ordenação por popularidade pode ficar até 5 minutos desatualizada.

Para rodar localmente com a mesma ordenação, copie essas duas variáveis para
um `.env.local`.

**Proteção contra abuso**: `POST /api/candidatos` (o endpoint que registra
uma seleção) valida que o `sq` enviado é uma candidatura real antes de
gravar no Redis, e limita a 20 seleções por minuto por IP
(`@upstash/ratelimit`) — o suficiente pra uso normal, pouco o bastante pra
inviabilizar inflar o placar de alguém ou estourar a cota do Upstash via
script. Sem Redis configurado, essa rota não tem o que limitar (nem placar
pra inflar).

## Deploy

Projeto pronto para deploy na [Vercel](https://vercel.com/new) — é uma
aplicação Next.js padrão. Nenhuma variável de ambiente é obrigatória; Redis é
opcional (ver seção acima).
