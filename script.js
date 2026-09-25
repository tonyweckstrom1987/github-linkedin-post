const GITHUB_USERNAME = 'tonyweckstrom1987';

function formatDate(isoString) {
    if (!isoString) {
        return 'Tuntematon';
    }
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) {
        return isoString;
    }
    return date.toLocaleDateString('fi-FI');
}

function buildPostText(repo) {
    const description = repo.description || 'Ei kuvausta';
    return `📁 ${repo.name}\n${description}\n${repo.html_url}\nJulkaistu: ${formatDate(repo.created_at)}`;
}

async function copyToClipboard(text, navigatorObj, alertFn) {
    if (!navigatorObj || !navigatorObj.clipboard) {
        throw new Error('Leikepöytä ei ole käytettävissä.');
    }
    await navigatorObj.clipboard.writeText(text);
    if (typeof alertFn === 'function') {
        alertFn('Kopioitu leikepöydälle!');
    }
}

function createRepoCard(repo, doc, deps) {
    const navigatorObj = (deps && deps.navigatorObj) || (typeof navigator !== 'undefined' ? navigator : undefined);
    const alertFn = (deps && deps.alertFn) || (typeof alert !== 'undefined' ? alert : undefined);

    const card = doc.createElement('div');
    card.className = 'repo-card';

    const heading = doc.createElement('p');
    heading.className = 'repo-name';
    heading.textContent = `📁 ${repo.name}`;
    card.appendChild(heading);

    const description = doc.createElement('p');
    description.className = 'repo-description';
    description.textContent = repo.description || 'Ei kuvausta';
    card.appendChild(description);

    const link = doc.createElement('a');
    link.href = repo.html_url;
    link.textContent = repo.html_url;
    const linkWrapper = doc.createElement('p');
    linkWrapper.appendChild(link);
    card.appendChild(linkWrapper);

    const date = doc.createElement('p');
    date.className = 'repo-date';
    date.textContent = `Julkaistu: ${formatDate(repo.created_at)}`;
    card.appendChild(date);

    const button = doc.createElement('button');
    button.type = 'button';
    button.textContent = 'Kopioi leikepöydälle';
    button.addEventListener('click', () => {
        copyToClipboard(buildPostText(repo), navigatorObj, alertFn).catch(() => {
            if (typeof alertFn === 'function') {
                alertFn('Kopiointi leikepöydälle epäonnistui.');
            }
        });
    });
    card.appendChild(button);

    card.appendChild(doc.createElement('hr'));

    return card;
}

function clearContainer(container) {
    if (typeof container.replaceChildren === 'function') {
        container.replaceChildren();
    } else {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    }
}

function renderRepos(repos, container, doc, deps) {
    clearContainer(container);

    if (!Array.isArray(repos) || repos.length === 0) {
        const empty = doc.createElement('p');
        empty.className = 'empty';
        empty.textContent = 'Repoja ei löytynyt.';
        container.appendChild(empty);
        return;
    }

    repos.forEach((repo) => {
        container.appendChild(createRepoCard(repo, doc, deps));
    });
}

function renderMessage(message, className, container, doc) {
    clearContainer(container);
    const paragraph = doc.createElement('p');
    paragraph.className = className;
    paragraph.textContent = message;
    container.appendChild(paragraph);
}

function renderLoading(container, doc) {
    renderMessage('Ladataan repoja...', 'loading', container, doc);
}

function renderError(message, container, doc) {
    renderMessage(message, 'error', container, doc);
}

async function loadRepos(username, container, doc, fetchFn, deps) {
    renderLoading(container, doc);
    try {
        const response = await fetchFn(`https://api.github.com/users/${username}/repos`);
        if (!response.ok) {
            throw new Error(`GitHub API vastasi statuksella ${response.status}`);
        }
        const data = await response.json();
        renderRepos(data, container, doc, deps);
    } catch (error) {
        renderError('Repojen haku epäonnistui. Yritä myöhemmin uudelleen.', container, doc);
    }
}

function init() {
    const container = document.getElementById('repot');
    if (!container) {
        return;
    }
    loadRepos(GITHUB_USERNAME, container, document, (url) => fetch(url));
}

if (typeof document !== 'undefined') {
    init();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GITHUB_USERNAME,
        formatDate,
        buildPostText,
        copyToClipboard,
        createRepoCard,
        renderRepos,
        renderMessage,
        renderLoading,
        renderError,
        loadRepos,
        init,
    };
}
