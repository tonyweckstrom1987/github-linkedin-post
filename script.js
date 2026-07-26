const container = document.getElementById('repot');
fetch('https://api.github.com/users/tonyweckstrom1987/repos')
    .then(response => response.json())
    .then(data => data.forEach(repo => {
        const teksti = `📁 ${repo.name}\n${repo.description || 'Ei kuvausta'}\n${repo.html_url}\nJulkaistu: ${repo.created_at}`;
        container.innerHTML += `<p>📁 ${repo.name}<br>${repo.description || 'Ei kuvausta'}<br><a href="${repo.html_url}">${repo.html_url}</a><br>Julkaistu: ${repo.created_at}</p><button onclick="navigator.clipboard.writeText(\`${teksti}\`); alert('Kopioitu leikepöydälle!')">Kopioi leikepöydälle</button><hr>`;
    }));