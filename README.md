# Quiz de marques

Projecte web de tipus quiz basat en preguntes sobre marques, productes i empreses conegudes del món de la tecnologia, la moda, l'alimentació, l'esport i el retail. La idea del joc és senzilla: l'usuari inicia sessió, es genera una partida aleatòria i respon una sèrie de preguntes de resposta múltiple amb imatge i temporització visual molt bàsica.

## Descripció

Aquest projecte combina un frontend lleuger en HTML, CSS i JavaScript amb un backend en Node.js i Express. Les preguntes es gestionen des d'arxius JSON i es serveixen al client de forma dinàmica per generar partides diferents cada vegada.

L'objectiu principal és practicar conceptes de:

- desenvolupament frontend amb DOM i esdeveniments
- ús de fetch per a la comunicació client-servidor
- emmagatzematge de sessió amb sessionId
- gestió de dades JSON en backend
- estructura moderna d'aplicació web senzilla

## Funcionalitats

- Login bàsic amb nom d'usuari i contrasenya
- Generació de sessió per usuari
- Obtenció de preguntes aleatòries des del backend
- Mescla d'opcions per tal que la resposta correcta aparegui en posicions diferents
- Visualització d'una pregunta per vegada
- Progrés de l'usuari durant la partida
- Ús d'imatges associades a cada pregunta
- Estructura preparada per ampliar-se amb puntuació final, temporitzador, estadístiques i millores d'UX

## Tecnologies utilitzades

- HTML5
- CSS3
- JavaScript vanilla
- Node.js
- Express
- CORS
- UUID per a la generació de sessions
- JSON com a font de dades

## Estructura del projecte

- backend/
  - app.js: servidor principal amb rutes de login, sessió i preguntes
  - preguntes.json: conjunt de preguntes del quiz
  - respostes.json: respostes o estructura auxiliar per al backend
  - package.json: dependències i configuració del projecte
- frontend/
  - index.html: estructura principal de l'aplicació
  - script.js: lògica del joc i comunicació amb el backend
  - style.css: estil visual de la interfície
  - img/: recursos gràfics de les marques i preguntes
- doc/
  - README.md: documentació tècnica i explicació del funcionament

## Com funciona

1. L'usuari entra a l'aplicació i omple el formulari de login.
2. El frontend envia les dades al backend mitjançant una petició POST a /login.
3. El servidor crea una sessió única i retorna un sessionId.
4. El client guarda aquest identificador a localStorage.
5. Quan s'inicia la partida, el navegador sol·licita /preguntes amb el sessionId.
6. El backend barreja les preguntes, selecciona un conjunt i les retorna amb opcions aleatòries.
7. El frontend renderitza la primera pregunta i espera la resposta de l'usuari.
8. El flux continua amb la següent pregunta fins completar la partida.

## Inici del projecte

Des de la carpeta backend, instala les dependències:

npm install

I arrenca el servidor:

node app.js

L'aplicació es serveix normalment a:

http://localhost:40500

## Estil visual

El projecte manté un estil senzill, net i funcional, orientat a una pràctica acadèmica de desenvolupament web. La interfície utilitza una composició centrada, blocs amb vores arrodonides, botons simples i un disseny minimalista ideal per evidenciar la lògica del joc sense dependre de frameworks ni llibreries externes.

## Objectiu del projecte

És una pràctica de front-end + back-end en la qual es pretén combinar un joc interactiu amb una lògica mínima d'autenticació, gestió de sessió i consum de dades dinàmiques. L'enfocament està més en la comprensió del flux complet d'una aplicació web que en la complexitat visual o tècnica.

## Estat del projecte

El projecte està en una fase funcional bàsica, amb una base sòlida per seguir ampliant l'experiència de joc amb noves funcionalitats com:

- puntuació final
- sistema de temps per pregunta
- resum de respostes correctes i incorrectes
- millora de l'estil visual
- persistència de partides o resultats
- integració amb base de dades

---

Projecte desenvolupat com a exercici d'aprenentatge en programació web i lògica d'aplicació full-stack.
