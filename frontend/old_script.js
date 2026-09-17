const element = document.getElementById("partida");

const preguntesTOTAL = {
  "preguntes": [
    {
      "pregunta": "Quina marca de cotxes utilitza el lema 'Ultimate Driving Machine'?",
      "resposta_correcta": "BMW",
      "respostes_incorrectes": [
        "Mercedes-Benz",
        "Audi",
        "Lexus"
      ],
      "imatge": "./img/audi.png"
    },
    {
      "pregunta": "Quina marca de tecnologia té una poma mossegada com a logotip?",
      "resposta_correcta": "Apple",
      "respostes_incorrectes": [
        "Samsung",
        "Microsoft",
        "Sony"
      ],
      "imatge": "https://exemple.com/apple.jpg"
    },
    {
      "pregunta": "Quina marca esportiva és mundialment coneguda pel seu eslògan 'Just Do It'?",
      "resposta_correcta": "Nike",
      "respostes_incorrectes": [
        "Adidas",
        "Puma",
        "Reebok"
      ],
      "imatge": "https://exemple.com/nike.jpg"
    },
    {
      "pregunta": "Quina cadena de menjar ràpid té dos arcs daurats que formen una lletra 'M'?",
      "resposta_correcta": "McDonald's",
      "respostes_incorrectes": [
        "Burger King",
        "KFC",
        "Subway"
      ],
      "imatge": "https://exemple.com/mcdonalds.jpg"
    },
    {
      "pregunta": "Quina coneguda marca de begudes té històricament una forta associació amb la imatge del Pare Noel?",
      "resposta_correcta": "Coca-Cola",
      "respostes_incorrectes": [
        "Pepsi",
        "Fanta",
        "Dr Pepper"
      ],
      "imatge": "https://exemple.com/cocacola.jpg"
    },
    {
      "pregunta": "Quina marca sueca és famosa pels seus mobles que has de muntar tu mateix a casa?",
      "resposta_correcta": "IKEA",
      "respostes_incorrectes": [
        "Leroy Merlin",
        "Conforama",
        "Maison du Monde"
      ],
      "imatge": "https://exemple.com/ikea.jpg"
    },
    {
      "pregunta": "Quina plataforma de streaming de sèries i pel·lícules va començar sent un servei de lloguer de DVDs per correu?",
      "resposta_correcta": "Netflix",
      "respostes_incorrectes": [
        "HBO Max",
        "Amazon Prime",
        "Disney+"
      ],
      "imatge": "https://exemple.com/netflix.jpg"
    },
    {
      "pregunta": "Quina marca de targetes de crèdit té un logotip format per dos cercles entrellaçats, un vermell i un groc?",
      "resposta_correcta": "Mastercard",
      "respostes_incorrectes": [
        "Visa",
        "American Express",
        "Paypal"
      ],
      "imatge": "https://exemple.com/mastercard.jpg"
    },
    {
      "pregunta": "Quina marca de joguines és famosa pels seus blocs de construcció de plàstic acoblables creats a Dinamarca?",
      "resposta_correcta": "LEGO",
      "respostes_incorrectes": [
        "Playmobil",
        "Meccano",
        "Mattel"
      ],
      "imatge": "https://exemple.com/lego.jpg"
    },
    {
      "pregunta": "Quin fabricant d'electrònica produeix la popular línia de telèfons mòbils 'Galaxy'?",
      "resposta_correcta": "Samsung",
      "respostes_incorrectes": [
        "Xiaomi",
        "Huawei",
        "Motorola"
      ],
      "imatge": "https://exemple.com/samsung.jpg"
    }
  ]
};

const pregunta1 = preguntesTOTAL.preguntes[0];
const pregunta2 = preguntesTOTAL.preguntes[1];
const pregunta3 = preguntesTOTAL.preguntes[2];
const pregunta4 = preguntesTOTAL.preguntes[3];
const pregunta5 = preguntesTOTAL.preguntes[4];
const pregunta6 = preguntesTOTAL.preguntes[5];
const pregunta7 = preguntesTOTAL.preguntes[6];
const pregunta8 = preguntesTOTAL.preguntes[7];
const pregunta9 = preguntesTOTAL.preguntes[8];
const pregunta10 = preguntesTOTAL.preguntes[9];


const contingutHTML = `<div>
  <h2>Pregunta 1</h2>
  <p>${pregunta1.pregunta}</p>

  <img src="${pregunta1.imatge}" alt="Imatge pista" style="width:200px;height:200px">

  <button onclick="comprovarResposta('${pregunta1.resposta_correcta}')">${pregunta1.resposta_correcta}</button>
  <button onclick="comprovarResposta('${pregunta1.respostes_incorrectes[0]}')">${pregunta1.respostes_incorrectes[0]}</button>
  <button onclick="comprovarResposta('${pregunta1.respostes_incorrectes[1]}')">${pregunta1.respostes_incorrectes[1]}</button>
  <button onclick="comprovarResposta('${pregunta1.respostes_incorrectes[2]}')">${pregunta1.respostes_incorrectes[2]}</button>

</div>`;

element.innerHTML = contingutHTML;




