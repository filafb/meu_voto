# Meu Voto 2026

Descubra a federação partidária do seu candidato a deputado federal ou estadual
nas eleições de 2026, e todos os outros candidatos que integram a mesma
federação no seu estado.

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

**Candidatos e informações complementares** (nome, partido, federação,
idade, reeleição, etc.):

1. Baixe, pelo navegador:
   - <https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_2026.zip>
   - <https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand_complementar/consulta_cand_complementar_2026.zip>
2. Extraia os arquivos `consulta_cand_2026_<UF>.csv` e
   `consulta_cand_complementar_2026_<UF>.csv` para `data/raw/`.
3. Rode `node scripts/build-data.mjs`, que regenera os arquivos em
   `public/data/`.

**Fotos dos candidatos:**

1. Baixe, pelo navegador, um zip por UF:
   `https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2026/fotos/foto_cand2026_<UF>_div.zip`
2. Extraia cada zip em uma pasta própria por UF, ex.: `<pasta>/<UF>/*.jpg`.
3. Rode `FOTOS_RAW_DIR=<pasta> node scripts/build-fotos.mjs`, que copia só as
   fotos das/os candidatas/os usadas pelo app para `public/fotos/<SQ>.jpg`.

Reinicie o servidor de dev depois de regenerar os dados — os arquivos de
`public/data/` ficam em cache de processo enquanto o servidor roda.

## Deploy

Projeto pronto para deploy na [Vercel](https://vercel.com/new) — é uma
aplicação Next.js padrão, sem variáveis de ambiente ou serviços externos.
