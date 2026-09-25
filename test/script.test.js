const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const {
    formatDate,
    buildPostText,
    copyToClipboard,
    renderRepos,
    renderError,
    renderLoading,
    loadRepos,
} = require('../script.js');

function makeDocument() {
    const dom = new JSDOM('<!DOCTYPE html><body><div id="repot"></div></body>');
    return {
        document: dom.window.document,
        container: dom.window.document.getElementById('repot'),
    };
}

const sampleRepo = {
    name: 'esimerkki-repo',
    description: 'Testirepo yksikkötestejä varten',
    html_url: 'https://github.com/tonyweckstrom1987/esimerkki-repo',
    created_at: '2024-03-15T10:00:00Z',
};

test('formatDate muotoilee ISO-päivämäärän suomalaiseen muotoon', () => {
    const result = formatDate('2024-03-15T10:00:00Z');
    assert.equal(result, new Date('2024-03-15T10:00:00Z').toLocaleDateString('fi-FI'));
});

test('formatDate palauttaa "Tuntematon" kun päivämäärä puuttuu', () => {
    assert.equal(formatDate(undefined), 'Tuntematon');
    assert.equal(formatDate(''), 'Tuntematon');
});

test('formatDate palauttaa alkuperäisen merkkijonon kelvottomalle päivämäärälle', () => {
    assert.equal(formatDate('ei-paivamaara'), 'ei-paivamaara');
});

test('buildPostText muotoilee postausluonnoksen oikein', () => {
    const text = buildPostText(sampleRepo);
    assert.match(text, /📁 esimerkki-repo/);
    assert.match(text, /Testirepo yksikkötestejä varten/);
    assert.match(text, /https:\/\/github\.com\/tonyweckstrom1987\/esimerkki-repo/);
    assert.match(text, /Julkaistu:/);
});

test('buildPostText käyttää oletustekstiä puuttuvalle kuvaukselle', () => {
    const text = buildPostText({ ...sampleRepo, description: null });
    assert.match(text, /Ei kuvausta/);
});

test('copyToClipboard kutsuu navigator.clipboard.writeText ja alert-funktiota', async () => {
    const calls = [];
    const navigatorObj = {
        clipboard: {
            writeText: (text) => {
                calls.push(text);
                return Promise.resolve();
            },
        },
    };
    const alerts = [];
    await copyToClipboard('testiteksti', navigatorObj, (msg) => alerts.push(msg));

    assert.deepEqual(calls, ['testiteksti']);
    assert.deepEqual(alerts, ['Kopioitu leikepöydälle!']);
});

test('copyToClipboard heittää virheen jos leikepöytä ei ole käytettävissä', async () => {
    await assert.rejects(() => copyToClipboard('x', {}, () => {}));
});

test('renderRepos luo kortin jokaiselle repolle', () => {
    const { document, container } = makeDocument();
    renderRepos([sampleRepo, { ...sampleRepo, name: 'toinen-repo' }], container, document);

    const cards = container.querySelectorAll('.repo-card');
    assert.equal(cards.length, 2);
    assert.match(cards[0].querySelector('.repo-name').textContent, /esimerkki-repo/);
    assert.match(cards[1].querySelector('.repo-name').textContent, /toinen-repo/);
});

test('renderRepos näyttää tyhjän tilan viestin kun repoja ei ole', () => {
    const { document, container } = makeDocument();
    renderRepos([], container, document);

    const empty = container.querySelector('.empty');
    assert.ok(empty);
    assert.equal(empty.textContent, 'Repoja ei löytynyt.');
});

test('renderRepos tyhjentää aiemman sisällön ennen uutta renderöintiä', () => {
    const { document, container } = makeDocument();
    renderRepos([sampleRepo], container, document);
    renderRepos([], container, document);

    assert.equal(container.querySelectorAll('.repo-card').length, 0);
    assert.ok(container.querySelector('.empty'));
});

test('renderRepos ei tuota XSS-alttiita HTML:ää repon nimestä/kuvauksesta', () => {
    const { document, container } = makeDocument();
    const malicious = {
        name: '<img src=x onerror="window.__pwned=true">',
        description: '</p><script>window.__pwned2=true</script>',
        html_url: 'https://example.com',
        created_at: '2024-01-01T00:00:00Z',
    };
    renderRepos([malicious], container, document);

    assert.equal(container.querySelector('script'), null);
    assert.equal(container.querySelector('img'), null);
    assert.match(container.querySelector('.repo-name').textContent, /<img/);
});

test('renderError näyttää virheviestin', () => {
    const { document, container } = makeDocument();
    renderError('Jokin meni pieleen', container, document);

    const error = container.querySelector('.error');
    assert.ok(error);
    assert.equal(error.textContent, 'Jokin meni pieleen');
});

test('renderLoading näyttää latausviestin', () => {
    const { document, container } = makeDocument();
    renderLoading(container, document);

    const loading = container.querySelector('.loading');
    assert.ok(loading);
    assert.equal(loading.textContent, 'Ladataan repoja...');
});

test('loadRepos renderöi reposit onnistuneen haun jälkeen', async () => {
    const { document, container } = makeDocument();
    const fetchFn = async () => ({
        ok: true,
        status: 200,
        json: async () => [sampleRepo],
    });

    await loadRepos('tonyweckstrom1987', container, document, fetchFn);

    assert.equal(container.querySelectorAll('.repo-card').length, 1);
});

test('loadRepos näyttää virheviestin kun API vastaa virhestatuksella', async () => {
    const { document, container } = makeDocument();
    const fetchFn = async () => ({
        ok: false,
        status: 404,
        json: async () => ({}),
    });

    await loadRepos('tonyweckstrom1987', container, document, fetchFn);

    assert.ok(container.querySelector('.error'));
});

test('loadRepos näyttää virheviestin kun fetch epäonnistuu verkkovirheeseen', async () => {
    const { document, container } = makeDocument();
    const fetchFn = async () => {
        throw new Error('Verkkovirhe');
    };

    await loadRepos('tonyweckstrom1987', container, document, fetchFn);

    assert.ok(container.querySelector('.error'));
});
