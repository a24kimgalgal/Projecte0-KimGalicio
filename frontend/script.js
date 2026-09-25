const seccioLogin = document.getElementById('seccio-login');
const seccioQuiz = document.getElementById('seccio-quiz');
const elementPartida = document.getElementById("partida");

let estatDeLaPartida = {
    contadorPreguntes: 0,
    respostesUsuari: [],
    totalPreguntes: 0,
    llistaPreguntes: []
};

let intervalTemps;
let tempsTranscorregut = 0;

const sessionId = localStorage.getItem('sessionId');
const savedUsername = localStorage.getItem('username');

if (sessionId && savedUsername) {
    // Fem el fetch per assegurar-nos que la sessió del localStorage encara existeix al servidor
    fetch('/session', { headers: { 'session-id': sessionId } })
        .then(res => res.json())
        .then(data => {
            if (data.loggedIn) {
                seccioLogin.classList.add('hidden');
                document.getElementById('seccio-salutacio').classList.remove('hidden');
                document.getElementById('missatge-salutacio').innerText = `Hola, ${savedUsername}!`;
            } else {
                // Si la sessió ha caducat o el servidor s'ha reiniciat, netegem
                localStorage.removeItem('sessionId');
                localStorage.removeItem('username');
            }
        });
}

document.getElementById('boto-començar-joc').addEventListener('click', () => {
    document.getElementById('boto-començar-joc').classList.add('hidden');
    arrancarQuiz();
});

document.getElementById('boto-esborrar-nom').addEventListener('click', () => {
    localStorage.removeItem('sessionId');
    localStorage.removeItem('username');
    location.reload();
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
                localStorage.setItem('sessionId', data.sessionId);
                localStorage.setItem('username', data.username);

                seccioLogin.classList.add('hidden');
                document.getElementById('seccio-salutacio').classList.remove('hidden');
                document.getElementById('missatge-salutacio').innerText = `Hola, ${data.username}!`;
            } else {
                alert('Error al iniciar sessió. Comprova les dades.');
            }
        });
});

function arrancarQuiz() {
    seccioLogin.classList.add('hidden');
    seccioQuiz.classList.remove('hidden');

    const sessionId = localStorage.getItem('sessionId');
    fetch('/preguntes', { headers: { 'session-id': sessionId } })
        .then(res => res.json())
        .then(data => {
            console.log("Preguntas recibidas del servidor:", data);
            const preguntesRebudes = data.preguntes || data;

            estatDeLaPartida.llistaPreguntes = preguntesRebudes;
            estatDeLaPartida.totalPreguntes = preguntesRebudes.length;
            
            tempsTranscorregut = 0;
            document.getElementById("comptador-temps").innerText = `Temps: 0s`;
            document.getElementById("comptador-temps").classList.remove("hidden");
            intervalTemps = setInterval(() => {
                tempsTranscorregut++;
                document.getElementById("comptador-temps").innerText = `Temps: ${tempsTranscorregut}s`;
            }, 1000);

            iniciarPartida();
            renderitzarMarcador();
        })
        .catch(error => console.error("Error carregant les preguntes:", error));
}

elementPartida.addEventListener("click", (event) => {
    if (event.target.classList.contains("resposta")) {
        const preguntaActual = estatDeLaPartida.llistaPreguntes[estatDeLaPartida.contadorPreguntes];

        estatDeLaPartida.respostesUsuari.push({
            preguntaId: preguntaActual.id || estatDeLaPartida.contadorPreguntes, // Idealment preguntaActual.id
            resposta: event.target.innerText
        });

        estatDeLaPartida.contadorPreguntes++;
        renderitzarMarcador();
        iniciarPartida();
    }
});

function iniciarPartida() {
    if (estatDeLaPartida.contadorPreguntes >= estatDeLaPartida.totalPreguntes) {
        clearInterval(intervalTemps);
        elementPartida.innerHTML = "<h2>Partida Acabada!</h2>";
        document.getElementById("boto-enviar").classList.remove("hidden");
        return;
    }

    const p = estatDeLaPartida.llistaPreguntes[estatDeLaPartida.contadorPreguntes];
    const imatgeHtml = p.imatge ? `<img src="${p.imatge}" style="width: 200px; border-radius: 8px; margin-bottom: 15px;">` : "";
    const botonsHtml = p.respostes.map(resposta => `<button class="resposta">${resposta}</button>`).join('');

    elementPartida.innerHTML = `
        <h3>${p.pregunta}</h3>
        ${imatgeHtml}
        <div id="botons">
            ${botonsHtml}
        </div>
    `;
}

function renderitzarMarcador() {
    document.getElementById('marcador').innerText = `Preguntes respostes: ${estatDeLaPartida.respostesUsuari.length} de ${estatDeLaPartida.totalPreguntes}`;
}

document.getElementById("boto-enviar").addEventListener("click", () => {
    const sessionId = localStorage.getItem('sessionId');

    const respostesObject = {};
    estatDeLaPartida.respostesUsuari.forEach(r => {
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
                elementPartida.innerHTML = `
                <h2>Resultats Finals</h2>
                <p>Has encertat ${data.encerts} de ${data.total} preguntes.</p>
                <p>Puntuació: ${data.puntuacio}</p>
                <p>Temps trigat: ${data.temps} segons</p>
                <button onclick="location.reload()">Tornar a jugar</button>
            `;
                document.getElementById("boto-enviar").classList.add("hidden");
                document.getElementById("marcador").classList.add("hidden");
                document.getElementById("comptador-temps").classList.add("hidden");
            }
        })
        .catch(error => console.error("Error enviant respostes:", error));
});
//TODO: Millorar el tema de ensenyar las imatges (FET)
//TODO: Afegir botó per enviar les respostes al final de la partida i mostrar el resultat (FET)
//TODO: Afegir un sistema de puntuació i mostrar el resultat final amb les respostes correctes i incorrectes
//TODO: Afegir un sistema de temps per cada pregunta i mostrar el temps en el q ha completat totes les preguntes
//TODO: Afegir un botó d'eliminar nom