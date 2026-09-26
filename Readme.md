# github-linkedin-post

Hakee GitHub-repot ja muotoilee niistä valmiit LinkedIn-postausluonnokset kopioitavaksi.

[![CI](https://github.com/tonyweckstrom1987/github-linkedin-post/actions/workflows/ci.yml/badge.svg)](https://github.com/tonyweckstrom1987/github-linkedin-post/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/tonyweckstrom1987/github-linkedin-post/blob/main/LICENSE)

Olisin halunnut, että koko prosessi tapahtuu kokonaan automaattisesti, valitettavasti LinkedInin rajapinta olisi edellyttänyt minulta firmaa jotta tämä olisi onnistunut. Sovellus näyttää GitHub-repot valmiiksi muotoiltuna tekstinä, ja käyttäjä kopioi sen itse LinkedIniin — koska LinkedInin postaus-API ei ole avoin yksityishenkilöille.

🔗 [Kokeile sovellusta täällä](https://tonyweckstrom1987.github.io/github-linkedin-post/)

## Mitä sovellus tekee

1. Hakee sivun latautuessa käyttäjän `tonyweckstrom1987` julkiset GitHub-repot GitHub REST API:sta.
2. Näyttää jokaisesta reposta kortin: nimi, kuvaus, linkki ja julkaisupäivä.
3. Jokaisessa kortissa on "Kopioi leikepöydälle" -nappi, joka kopioi valmiiksi muotoillun LinkedIn-postaustekstin leikepöydälle.
4. Jos haku epäonnistuu (esim. verkkovirhe tai GitHubin API antaa virheen), sivulla näytetään selkeä virheilmoitus latausindikaattorin sijaan.

## Käytetyt tekniikat

- HTML, CSS
- JavaScript (fetch, GitHub REST API, DOM-manipulointi ilman `innerHTML`-injektioriskiä)
- [Node.js test runner](https://nodejs.org/api/test.html) (`node:test`) + [jsdom](https://github.com/jsdom/jsdom) yksikkötesteihin
- GitHub Actions CI, joka ajaa testit automaattisesti jokaisella pushilla ja pull requestilla

## Asennus ja käyttö

### Sovelluksen käyttö selaimessa

1. Kloonaa repo: `git clone https://github.com/tonyweckstrom1987/github-linkedin-post.git`
2. Avaa `index.html` selaimessa (esim. VS Coden Live Server -laajennuksella) tai käytä live-demoa yllä.
3. Sivu hakee automaattisesti GitHub-repot ja näyttää ne postausluonnoksina, joita voi kopioida leikepöydälle.

### Kehitysympäristön asennus (testejä varten)

Vaatii [Node.js](https://nodejs.org/):n (versio 18 tai uudempi).

```bash
npm install
```

## Testien ajaminen

```bash
npm test
```

Testit kattavat sovelluksen ydintoiminnot:

- postausluonnoksen muotoilun (`buildPostText`, `formatDate`) eri syötteillä, mukaan lukien puuttuva kuvaus tai virheellinen päivämäärä
- reposien renderöinnin DOM:iin, tyhjän tuloksen tilan sekä sen, ettei repon nimi/kuvaus voi tuottaa haitallista HTML:ää (XSS-suoja)
- leikepöydälle kopioinnin (`copyToClipboard`) onnistumis- ja virhetapaukset
- koko hakuketjun (`loadRepos`): onnistunut haku, GitHubin virhevastaus ja verkkovirhe

CI (`.github/workflows/ci.yml`) ajaa saman testisarjan automaattisesti jokaisella pushilla ja pull requestilla `main`-haaraan.

## Projektin rakenne

```
.
├── index.html              # Sovelluksen HTML-runko
├── script.js                # Sovelluslogiikka: GitHub-haku, renderöinti, kopiointi
├── package.json              # Riippuvuudet ja npm-skriptit
├── test/
│   └── script.test.js        # Yksikkötestit (node:test + jsdom)
└── .github/workflows/ci.yml  # GitHub Actions -työnkulku
```
