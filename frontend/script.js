const element = document.getElementById("partida");

let estatDeLaPartida = {
    contadorPreguntes: 0,
    respostesUsuari: [],
    totalPreguntes: 0,
    llistaPreguntes: []
}; 

element.addEventListener("click", (event) => {
    if (event.target.classList.contains("resposta")) {
        const respostaTriada = event.target.innerText;
        console.log("Has fet clic a:", respostaTriada);

        estatDeLaPartida.respostesUsuari.push({
            preguntaId: estatDeLaPartida.contadorPreguntes,
            resposta: respostaTriada
        });

        estatDeLaPartida.contadorPreguntes++;

        renderitzarMarcador();
        iniciarPartida();
    }
});

fetch('/preguntes') 
    .then(response => response.json()) 
    .then(data => {
        console.log("Dades carregades!");
        
        estatDeLaPartida.llistaPreguntes = data.preguntes;
        estatDeLaPartida.totalPreguntes = data.preguntes.length;
        
        iniciarPartida();
        renderitzarMarcador();
    })
    .catch(error => {
        console.error("Error", error);
    });


function iniciarPartida() {
    if (estatDeLaPartida.contadorPreguntes >= estatDeLaPartida.totalPreguntes) {
        element.innerHTML = "<h2>Partida Acabada!</h2>";
        document.getElementById("boto-enviar").classList.remove("hidden");
        return;
    }

    const preguntaActual = estatDeLaPartida.llistaPreguntes[estatDeLaPartida.contadorPreguntes];
    let respostes = [preguntaActual.resposta_correcta, ...preguntaActual.respostes_incorrectes];

    respostes.sort(() => Math.random() - 0.5);

    let stringHTML = `
        <h3>${preguntaActual.pregunta}</h3>
        <img src="${preguntaActual.imatge}" alt="Imatge" style="width: 200px; border-radius: 8px;">
        <div id="botons">
            <button class="resposta">${respostes[0]}</button>
            <button class="resposta">${respostes[1]}</button>
            <button class="resposta">${respostes[2]}</button>
            <button class="resposta">${respostes[3]}</button>
        </div>
    `;

    element.innerHTML = stringHTML;
}

function renderitzarMarcador() {
    const marcador = document.getElementById('marcador');
    if (marcador) {
        marcador.innerText = `Preguntes respostes: ${estatDeLaPartida.respostesUsuari.length} de ${estatDeLaPartida.totalPreguntes}`;
    }
}