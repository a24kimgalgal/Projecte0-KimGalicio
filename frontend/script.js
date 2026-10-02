const seccioLogin = document.getElementById('seccio-login');
const seccioQuiz = document.getElementById('seccio-quiz');
const elementPartida = document.getElementById('partida');
const questionNav = document.getElementById('question-nav');
const botoSeguent = document.getElementById('boto-seguent');
const sidebarToggle = document.getElementById('sidebar-toggle');
const quizLayout = document.querySelector('.quiz-layout');
const sidebar = document.getElementById('quiz-sidebar');
const ADMIN_USERNAME = 'admin';
const ADMIN_EMAIL = 'admin@gmail.com';
const isAdminUser = () => sessionStorage.getItem('isAdmin') === 'true';
const lobbyActions = document.getElementById('lobby-actions');
const botoTornarInici = document.getElementById('boto-tornar-inici');

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function esCredencialAdmin(username, email) {
    return String(username ?? '').trim() === ADMIN_USERNAME && String(email ?? '').trim().toLowerCase() === ADMIN_EMAIL;
}

function renderLobby() {
    const username = sessionStorage.getItem('username') || 'Usuari';
    const admin = isAdminUser();

    if (!lobbyActions) return;

    if (admin) {
        lobbyActions.innerHTML = `
            <div class="lobby-grid admin-grid">
                <button type="button" id="boto-començar-joc" class="card lobby-card-btn">
                    <span class="eyebrow">Jugar</span>
                    <h3>Començar Joc</h3>
                    <p>Accedeix a la partida activa.</p>
                </button>
                <button type="button" id="boto-panell-admin" class="card lobby-card-btn accent-card">
                    <span class="eyebrow">Gestió</span>
                    <h3>Panell d'Administració</h3>
                    <p>Administra preguntes i imatges.</p>
                </button>
            </div>
        `;

        document.getElementById('boto-panell-admin').addEventListener('click', () => {
            window.location.href = 'admin.html';
        });
    } else {
        lobbyActions.innerHTML = `
            <div class="lobby-grid single-grid">
                <button type="button" id="boto-començar-joc" class="card lobby-card-btn big-card">
                    <span class="eyebrow">Jugar</span>
                    <h3>Començar Joc</h3>
                    <p>Bon partit, ${escapeHtml(username)}.</p>
                </button>
            </div>
        `;
    }

    document.getElementById('boto-començar-joc')?.addEventListener('click', () => {
        document.getElementById('seccio-login').classList.add('hidden');
        document.getElementById('seccio-lobby').classList.add('hidden');
        seccioQuiz.classList.remove('hidden');
        document.getElementById('top-navbar').classList.remove('hidden');
        if (botoTornarInici) {
            botoTornarInici.classList.remove('hidden');
        }
        arrancarQuiz();
    });
}

function mostrarLobby() {
    const username = sessionStorage.getItem('username') || '';
    const isLogged = sessionStorage.getItem('isLogged') === 'true';

    if (!isLogged || !username) {
        seccioLogin.classList.remove('hidden');
        document.getElementById('seccio-lobby').classList.add('hidden');
        return;
    }

    if (botoTornarInici) {
        botoTornarInici.classList.add('hidden');
    }

    seccioLogin.classList.add('hidden');
    document.getElementById('seccio-lobby').classList.remove('hidden');
    document.getElementById('top-navbar').classList.remove('hidden');
    document.getElementById('missatge-salutacio').innerText = `Hola, ${username}!`;
    renderLobby();
}

function mostraLogin() {
    seccioLogin.classList.remove('hidden');
    document.getElementById('seccio-lobby').classList.add('hidden');
    seccioQuiz.classList.add('hidden');
    document.getElementById('top-navbar').classList.add('hidden');
    if (botoTornarInici) {
        botoTornarInici.classList.add('hidden');
    }
    document.getElementById('missatge-salutacio').innerText = '';
    document.getElementById('login-form').reset();
}

function tancarSessio() {
    sessionStorage.clear();
    mostraLogin();
}

let estatDeLaPartida = {
    contadorPreguntes: 0,
    respostesUsuari: [],
    totalPreguntes: 0,
    llistaPreguntes: []
};

let intervalTemps;
let tempsTranscorregut = 0;
let respostaSeleccionadaActual = null;

const sessionId = localStorage.getItem('sessionId');
const savedUsername = localStorage.getItem('username');

const savedSession = sessionStorage.getItem('isLogged') === 'true';
if (savedSession && sessionStorage.getItem('username')) {
    document.getElementById('seccio-login').classList.add('hidden');
    document.getElementById('top-navbar').classList.remove('hidden');
    document.getElementById('missatge-salutacio').innerText = `Hola, ${sessionStorage.getItem('username')}!`;
    mostrarLobby();
} else if (sessionId && savedUsername) {
    fetch('/session', { headers: { 'session-id': sessionId } })
        .then(res => res.json())
        .then(data => {
            if (data.loggedIn) {
                sessionStorage.setItem('isLogged', 'true');
                sessionStorage.setItem('username', savedUsername);
                sessionStorage.setItem('isAdmin', 'false');
                mostrarLobby();
            } else {
                localStorage.removeItem('sessionId');
                localStorage.removeItem('username');
                sessionStorage.clear();
                mostraLogin();
            }
        });
} else {
    mostraLogin();
}

if (botoTornarInici) {
    botoTornarInici.addEventListener('click', () => {
        clearInterval(intervalTemps);
        seccioQuiz.classList.add('hidden');
        botoTornarInici.classList.add('hidden');
        document.getElementById('top-navbar').classList.remove('hidden');
        document.getElementById('missatge-salutacio').innerText = `Hola, ${sessionStorage.getItem('username') || 'Usuari'}!`;
        mostrarLobby();
    });
}

document.getElementById('boto-esborrar-nom').addEventListener('click', () => {
    tancarSessio();
});

document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;

    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const admin = esCredencialAdmin(username, email);

                localStorage.setItem('sessionId', data.sessionId);
                localStorage.setItem('username', data.username);
                sessionStorage.setItem('isLogged', 'true');
                sessionStorage.setItem('username', data.username);
                sessionStorage.setItem('isAdmin', admin ? 'true' : 'false');
                sessionStorage.setItem('sessionId', data.sessionId);

                mostrarLobby();
            } else {
                alert('Error al iniciar sessió. Comprova les dades.');
            }
        });
});

function actualizarEtiquetaSidebar() {
    if (!sidebarToggle || !sidebar) return;

    const isCollapsed = sidebar.classList.contains('collapsed');
    const label = isCollapsed ? 'Mostrar preguntes' : 'Ocultar preguntes';

    sidebarToggle.setAttribute('aria-expanded', String(!isCollapsed));
    sidebarToggle.setAttribute('aria-label', label);
    sidebarToggle.title = label;

    const textNode = sidebarToggle.querySelector('.toggle-text');
    if (textNode) {
        textNode.textContent = label;
    }
}

function toggleSidebar(forceState) {
    if (!sidebar || !quizLayout) return;

    const shouldCollapse = typeof forceState === 'boolean' ? forceState : !sidebar.classList.contains('collapsed');
    sidebar.classList.toggle('collapsed', shouldCollapse);
    quizLayout.classList.toggle('sidebar-collapsed', shouldCollapse);
    actualizarEtiquetaSidebar();
}

sidebarToggle.addEventListener('click', () => {
    const isCollapsed = sidebar.classList.contains('collapsed');
    toggleSidebar(!isCollapsed);
});

elementPartida.addEventListener('click', (event) => {
    const respostaSeleccionada = event.target.closest('.resposta');
    if (!respostaSeleccionada) return;

    const botoRespostes = elementPartida.querySelectorAll('.resposta');
    botoRespostes.forEach((boto) => boto.classList.remove('selected'));
    respostaSeleccionada.classList.add('selected');
    respostaSeleccionadaActual = Number(respostaSeleccionada.dataset.index);
    botoSeguent.disabled = false;
    botoSeguent.classList.remove('hidden');
});

function navegarAQuestion(index) {
    if (index < 0 || index >= estatDeLaPartida.totalPreguntes) return;

    estatDeLaPartida.contadorPreguntes = index;
    respostaSeleccionadaActual = null;
    botoSeguent.disabled = true;
    botoSeguent.classList.add('hidden');
    renderNavPreguntes();
    iniciarPartida();
}

botoSeguent.addEventListener('click', () => {
    if (respostaSeleccionadaActual === null || respostaSeleccionadaActual === undefined) {
        return;
    }

    const preguntaActual = estatDeLaPartida.llistaPreguntes[estatDeLaPartida.contadorPreguntes];
    const preguntaId = preguntaActual.id || estatDeLaPartida.contadorPreguntes;
    const respostaActual = preguntaActual.respostes[respostaSeleccionadaActual];
    const indexResposta = estatDeLaPartida.respostesUsuari.findIndex((item) => String(item.preguntaId) === String(preguntaId));

    if (indexResposta >= 0) {
        estatDeLaPartida.respostesUsuari[indexResposta].resposta = respostaActual;
    } else {
        estatDeLaPartida.respostesUsuari.push({
            preguntaId: preguntaId,
            resposta: respostaActual
        });
    }

    estatDeLaPartida.contadorPreguntes++;
    respostaSeleccionadaActual = null;
    botoSeguent.disabled = true;

    renderitzarMarcador();
    renderNavPreguntes();

    if (estatDeLaPartida.contadorPreguntes >= estatDeLaPartida.totalPreguntes) {
        clearInterval(intervalTemps);
        elementPartida.innerHTML = "<div class='empty-state'><div><h2>Partida acabada</h2><p>Ja has contestat totes les preguntes.</p></div></div>";
        document.getElementById('boto-enviar').classList.remove('hidden');
        botoSeguent.classList.add('hidden');
        return;
    }

    iniciarPartida();
});

function arrancarQuiz() {
    seccioLogin.classList.add('hidden');
    seccioQuiz.classList.remove('hidden');
    seccioQuiz.classList.remove('results-state');
    sidebarToggle.classList.add('visible');
    toggleSidebar(false);

    const sessionId = localStorage.getItem('sessionId');
    fetch('/preguntes', { headers: { 'session-id': sessionId } })
        .then(res => res.json())
        .then(data => {
            const preguntesRebudes = data.preguntes || data;

            estatDeLaPartida.llistaPreguntes = preguntesRebudes;
            estatDeLaPartida.totalPreguntes = preguntesRebudes.length;
            estatDeLaPartida.contadorPreguntes = 0;
            estatDeLaPartida.respostesUsuari = [];
            respostaSeleccionadaActual = null;

            tempsTranscorregut = 0;
            document.getElementById('comptador-temps').innerText = 'Temps: 0s';
            document.getElementById('comptador-temps').classList.remove('hidden');
            document.getElementById('progress-container').classList.remove('hidden');
            document.getElementById('boto-enviar').classList.add('hidden');
            botoSeguent.classList.add('hidden');
            botonsTemps();
            renderNavPreguntes();
            iniciarPartida();
            renderitzarMarcador();
        })
        .catch(error => console.error('Error carregant les preguntes:', error));
}

function botonsTemps() {
    clearInterval(intervalTemps);
    intervalTemps = setInterval(() => {
        tempsTranscorregut++;
        document.getElementById('comptador-temps').innerText = `Temps: ${tempsTranscorregut}s`;
    }, 1000);
}

function renderNavPreguntes() {
    if (!questionNav) return;

    questionNav.innerHTML = estatDeLaPartida.llistaPreguntes.map((pregunta, index) => {
        const preguntaId = pregunta.id || index;
        const isAnswered = estatDeLaPartida.respostesUsuari.some((item) => String(item.preguntaId) === String(preguntaId));
        const isCurrent = index === estatDeLaPartida.contadorPreguntes;

        return `<button type="button" class="question-chip ${isAnswered ? 'answered' : ''} ${isCurrent ? 'current' : ''}" data-index="${index}" aria-label="Pregunta ${index + 1}">${index + 1}</button>`;
    }).join('');

    questionNav.querySelectorAll('.question-chip').forEach((chip) => {
        chip.addEventListener('click', () => navegarAQuestion(Number(chip.dataset.index)));
    });
}

function iniciarPartida() {
    if (estatDeLaPartida.contadorPreguntes >= estatDeLaPartida.totalPreguntes) {
        clearInterval(intervalTemps);
        elementPartida.innerHTML = "<div class='empty-state'><div><h2>Partida acabada</h2><p>Ja has contestat totes les preguntes.</p></div></div>";
        document.getElementById('boto-enviar').classList.remove('hidden');
        botoSeguent.classList.add('hidden');
        return;
    }

    const p = estatDeLaPartida.llistaPreguntes[estatDeLaPartida.contadorPreguntes];
    const imatgeHtml = p.imatge ? `<img src="${p.imatge}" alt="Imatge de la pregunta">` : '';
    const respostaGuardada = estatDeLaPartida.respostesUsuari.find((item) => String(item.preguntaId) === String(p.id || estatDeLaPartida.contadorPreguntes));
    const respostaSeleccionadaGuardada = respostaGuardada ? p.respostes.indexOf(respostaGuardada.resposta) : -1;
    const botonsHtml = p.respostes.map((resposta, index) => {
        const isSelected = (respostaSeleccionadaActual !== null && respostaSeleccionadaActual === index) || (respostaSeleccionadaGuardada === index);
        return `<button type="button" class="resposta ${isSelected ? 'selected' : ''}" data-index="${index}">${resposta}</button>`;
    }).join('');

    elementPartida.innerHTML = `
        <div class="meta">Pregunta ${estatDeLaPartida.contadorPreguntes + 1}</div>
        <h3>${p.pregunta}</h3>
        ${imatgeHtml}
        <div id="botons">
            ${botonsHtml}
        </div>
    `;

    botoSeguent.disabled = respostaSeleccionadaActual === null && respostaSeleccionadaGuardada === -1;
    botoSeguent.classList.toggle('hidden', respostaSeleccionadaActual === null && respostaSeleccionadaGuardada === -1);
    if (respostaSeleccionadaGuardada >= 0) {
        respostaSeleccionadaActual = respostaSeleccionadaGuardada;
    }
}

function renderitzarMarcador() {
    document.getElementById('marcador').innerText = `Preguntes respostes: ${estatDeLaPartida.respostesUsuari.length} de ${estatDeLaPartida.totalPreguntes}`;
    updateProgressBar();
}

function updateProgressBar() {
    if (estatDeLaPartida.totalPreguntes === 0) return;
    const progress = (estatDeLaPartida.respostesUsuari.length / estatDeLaPartida.totalPreguntes) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
}

document.getElementById('boto-enviar').addEventListener('click', () => {
    const sessionId = localStorage.getItem('sessionId');

    const respostesObject = {};
    estatDeLaPartida.respostesUsuari.forEach((r) => {
        respostesObject[r.preguntaId] = r.resposta;
    });

    fetch('/respostes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'session-id': sessionId
        },
        body: JSON.stringify({
            respostes: respostesObject,
            temps: tempsTranscorregut
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                seccioQuiz.classList.add('results-state');
                sidebarToggle.classList.remove('visible');
                toggleSidebar(true);
                elementPartida.innerHTML = `
                    <div class="results-panel">
                        <h2>Resultats finals</h2>
                        <div class="results-score">${data.puntuacio}</div>
                        <div class="results-details">
                            <p>Has encertat <strong>${data.encerts}</strong> de ${data.total} preguntes.</p>
                            <p>Temps trigat: <strong>${data.temps}</strong> segons</p>
                        </div>
                        <button class="btn btn-primary btn-large" onclick="location.reload()">Tornar a jugar</button>
                    </div>
                `;
                document.getElementById('boto-enviar').classList.add('hidden');
                document.querySelector('.stats-container').classList.add('hidden');
                document.getElementById('progress-container').classList.add('hidden');
                botoSeguent.classList.add('hidden');
            }
        })
        .catch(error => console.error('Error enviant respostes:', error));
});
