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
processo eleitoral. Para atualizar:

1. Baixe o zip de candidatos em
   <https://dadosabertos.tse.jus.br/dataset/candidatos-2026> (recurso
   "Candidatos") — atenção: o CDN do TSE bloqueia acessos fora do Brasil.
2. Extraia os arquivos `consulta_cand_2026_<UF>.csv` para `data/raw/`.
3. Rode `node scripts/build-data.mjs`, que regenera os arquivos em
   `public/data/`.

## Deploy

Projeto pronto para deploy na [Vercel](https://vercel.com/new) — é uma
aplicação Next.js padrão, sem variáveis de ambiente ou serviços externos.
