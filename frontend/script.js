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

//TODO: arreglar respuesta correcta

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
    llistaPreguntes: [],
    mode: 'quiz'
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
    if (!sidebar || !quizLayout) return;

    sidebar.classList.remove('collapsed');
    quizLayout.classList.remove('sidebar-collapsed');
}

function toggleSidebar(forceState) {
    if (!sidebar || !quizLayout) return;

    sidebar.classList.remove('collapsed');
    quizLayout.classList.remove('sidebar-collapsed');
}

if (sidebarToggle) {
    sidebarToggle.style.display = 'none';
    sidebarToggle.setAttribute('aria-hidden', 'true');
    sidebarToggle.disabled = true;
}

elementPartida.addEventListener('click', (event) => {
    if (estatDeLaPartida.mode === 'review') return;

    const respostaSeleccionada = event.target.closest('.resposta');
    if (!respostaSeleccionada) return;

    const botoRespostes = elementPartida.querySelectorAll('.resposta');
    botoRespostes.forEach((boto) => boto.classList.remove('selected'));
    respostaSeleccionada.classList.add('selected');
    respostaSeleccionadaActual = Number(respostaSeleccionada.dataset.index);
    botoSeguent.disabled = false;
    botoSeguent.classList.remove('hidden');
});

function obtenirRespostaUsuari(pregunta) {
    const preguntaId = pregunta.id || estatDeLaPartida.llistaPreguntes.indexOf(pregunta);
    const resposta = estatDeLaPartida.respostesUsuari.find((item) => String(item.preguntaId) === String(preguntaId));
    return resposta ? resposta.resposta : null;
}

function obtenirRespostaCorrecta(pregunta) {
    if (!pregunta) return null;
    return pregunta.resposta_correcta ?? pregunta.respostaCorrecta ?? null;
}

function renderPreguntaReview(index) {
    if (index < 0 || index >= estatDeLaPartida.totalPreguntes) return;

    const pregunta = estatDeLaPartida.llistaPreguntes[index];
    const respostaUsuari = obtenirRespostaUsuari(pregunta);
    const respostaCorrecta = obtenirRespostaCorrecta(pregunta);
    const esCorrecta = respostaUsuari !== null && respostaUsuari === respostaCorrecta;
    const imatgeHtml = pregunta.imatge ? `<img src="${pregunta.imatge}" alt="Imatge de la pregunta">` : '';

    elementPartida.innerHTML = `
        <div class="question-topbar d-flex justify-content-between align-items-center">
            <div class="meta question-label">Pregunta ${index + 1}</div>
            <div class="question-stat ${esCorrecta ? 'review-success' : 'review-error'}">
                ${esCorrecta ? 'Resposta correcta' : 'Resposta incorrecta'}
            </div>
        </div>
        <h3>${pregunta.pregunta}</h3>
        ${imatgeHtml}
        <div class="review-summary ${esCorrecta ? 'review-success' : 'review-error'}">
            <p>${esCorrecta ? 'Has encertat aquesta resposta.' : `La teva resposta va ser: <strong>${respostaUsuari || 'Sense resposta'}</strong>.`}</p>
            <p>Resposta correcta: <strong>${respostaCorrecta || 'Sense resposta'}</strong></p>
        </div>
        <div id="botons" class="review-options">
            ${pregunta.respostes.map((resposta, respostaIndex) => {
                const esRespostaUsuari = resposta === respostaUsuari;
                const esRespostaCorrecta = resposta === respostaCorrecta;
                const classes = [
                    'resposta',
                    'review-option',
                    esRespostaUsuari ? 'user-choice' : '',
                    esRespostaCorrecta ? 'correct-answer' : '',
                    esRespostaUsuari && !esRespostaCorrecta ? 'incorrect-answer' : ''
                ].filter(Boolean).join(' ');

                return `<button type="button" class="${classes}" data-index="${respostaIndex}" disabled>${resposta}</button>`;
            }).join('')}
        </div>
    `;

    estatDeLaPartida.contadorPreguntes = index;
    renderNavPreguntes();
    botoSeguent.classList.add('hidden');
}

function navegarAQuestion(index) {
    if (index < 0 || index >= estatDeLaPartida.totalPreguntes) return;

    if (estatDeLaPartida.mode === 'review') {
        renderPreguntaReview(index);
        return;
    }

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
    estatDeLaPartida.mode = 'quiz';
    seccioLogin.classList.add('hidden');
    seccioQuiz.classList.remove('hidden');
    seccioQuiz.classList.remove('results-state');
    if (sidebarToggle) {
        sidebarToggle.classList.add('visible');
    }
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
            document.getElementById('progress-container').classList.remove('hidden');
            document.getElementById('boto-enviar').classList.add('hidden');
            botoSeguent.classList.add('hidden');
            renderNavPreguntes();
            iniciarPartida();
            renderitzarMarcador();
            botonsTemps();
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
        const respostaUsuari = obtenirRespostaUsuari(pregunta);
        const respostaCorrecta = obtenirRespostaCorrecta(pregunta);
        const isCorrect = estatDeLaPartida.mode === 'review' && respostaUsuari !== null && respostaUsuari === respostaCorrecta;
        const isWrong = estatDeLaPartida.mode === 'review' && respostaUsuari !== null && respostaUsuari !== respostaCorrecta;

        const classes = [
            'question-chip',
            isAnswered ? 'answered' : '',
            isCurrent ? 'current' : '',
            estatDeLaPartida.mode === 'review' && isCorrect ? 'review-correct' : '',
            estatDeLaPartida.mode === 'review' && isWrong ? 'review-wrong' : ''
        ].filter(Boolean).join(' ');

        return `<button type="button" class="${classes}" data-index="${index}" aria-label="Pregunta ${index + 1}">${index + 1}</button>`;
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
        <div class="question-topbar d-flex justify-content-between align-items-center">
            <div class="meta question-label">Pregunta ${estatDeLaPartida.contadorPreguntes + 1}</div>
            <div id="comptador-temps" class="question-stat timer-stat">Temps: ${tempsTranscorregut}s</div>
            <div id="marcador" class="question-stat counter-stat">Preguntes respostes: ${estatDeLaPartida.respostesUsuari.length} de ${estatDeLaPartida.totalPreguntes}</div>
        </div>
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
                clearInterval(intervalTemps);
                estatDeLaPartida.mode = 'review';
                seccioQuiz.classList.add('results-state');
                if (sidebarToggle) {
                    sidebarToggle.classList.remove('visible');
                }
                if (sidebar) {
                    toggleSidebar(false);
                }
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
                const statsContainer = document.querySelector('.stats-container');
                if (statsContainer) {
                    statsContainer.classList.add('hidden');
                }
                document.getElementById('progress-container').classList.add('hidden');
                botoSeguent.classList.add('hidden');
                renderNavPreguntes();
            }
        })
        .catch(error => console.error('Error enviant respostes:', error));
});
