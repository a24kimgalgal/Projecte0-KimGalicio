const seccioLogin = document.getElementById('seccio-login');
const seccioQuiz = document.getElementById('seccio-quiz');
const elementPartida = document.getElementById("partida");

let estatDeLaPartida = {
    contadorPreguntes: 0,
    respostesUsuari: [],
    totalPreguntes: 0,
    llistaPreguntes: []
};

const sessionId = localStorage.getItem('sessionId');
if (sessionId) {
    fetch('/session', { headers: { 'session-id': sessionId } })
        .then(res => res.json())
        .then(data => {
            if (data.loggedIn) arrancarQuiz();
        });
}

document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem('sessionId', data.sessionId);
            arrancarQuiz();
        } else {
            alert('Usuari o contrasenya incorrectes');
        }
    });
});

function arrancarQuiz() {
    seccioLogin.classList.add('hidden');
    seccioQuiz.classList.remove('hidden');

    fetch('/preguntes') 
        .then(res => res.json()) 
        .then(data => {
            estatDeLaPartida.llistaPreguntes = data.preguntes;
            estatDeLaPartida.totalPreguntes = data.preguntes.length;
            iniciarPartida();
            renderitzarMarcador();
        });
}

elementPartida.addEventListener("click", (event) => {
    if (event.target.classList.contains("resposta")) {
        estatDeLaPartida.respostesUsuari.push({
            preguntaId: estatDeLaPartida.contadorPreguntes,
            resposta: event.target.innerText
        });
        estatDeLaPartida.contadorPreguntes++;
        renderitzarMarcador();
        iniciarPartida();
    }
});

function iniciarPartida() {
    if (estatDeLaPartida.contadorPreguntes >= estatDeLaPartida.totalPreguntes) {
        elementPartida.innerHTML = "<h2>Partida Acabada!</h2>";
        document.getElementById("boto-enviar").classList.remove("hidden");
        return;
    }

    const p = estatDeLaPartida.llistaPreguntes[estatDeLaPartida.contadorPreguntes];
    let respostes = [p.resposta_correcta, ...p.respostes_incorrectes].sort(() => Math.random() - 0.5);

    //TODO: Millorar el tema de ensenyar las imatges
    //TODO: Afegir botó per enviar les respostes al final de la partida i mostrar el resultat
    //TODO: Afegir un sistema de puntuació i mostrar el resultat final amb les respostes correctes i incorrectes
    //TODO: Afegir un sistema de temps per cada pregunta i mostrar el temps en el q ha completat totes les preguntes

    elementPartida.innerHTML = `
        <h3>${p.pregunta}</h3>
        <img src="${p.imatge}" style="width: 200px; border-radius: 8px;">
        <div id="botons">
            <button class="resposta">${respostes[0]}</button>
            <button class="resposta">${respostes[1]}</button>
            <button class="resposta">${respostes[2]}</button>
            <button class="resposta">${respostes[3]}</button>
        </div>
    `;
}

function renderitzarMarcador() {
    document.getElementById('marcador').innerText = `Preguntes respostes: ${estatDeLaPartida.respostesUsuari.length} de ${estatDeLaPartida.totalPreguntes}`;
}