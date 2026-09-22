# Documentació tècnica del projecte

## Visió general

Aquest projecte consisteix en un joc de preguntes sobre marques i empreses conegudes. L'aplicació està dividida en dues capes principals:

- frontend: part visual i d'interacció de l'usuari
- backend: servidor HTTP que gestiona sessions, entrega preguntes i serveix les dades

La idea és crear una experiència tipus quiz on cada partida es genera de forma aleatòria i l'usuari avança pregunta a pregunta fins finalitzar la bateria de preguntes.

## Tecnologies utilitzades

### Frontend

- HTML: estructura de la interfície
- CSS: estils i distribució visual
- JavaScript: lògica del quiz, esdeveniments i connexió amb el backend
- localStorage: emmagatzematge temporal del sessionId

### Backend

- Node.js: entorn d'execució JavaScript del servidor
- Express: framework per crear rutes HTTP i servir arxius estàtics
- CORS: habilita sol·licituds des del client al servidor
- UUID: generació d'identificadors únics per sessió
- JSON: emmagatzematge de preguntes i respostes

## Estructura del projecte

### backend/

La carpeta backend conté la lògica del servidor.

- app.js
  - inicialitza Express
  - activa CORS i l'anàlisi de JSON
  - serveix els arxius del frontend
  - defineix les rutes /login, /session i /preguntes
  - gestiona sessions en memòria amb Map

- preguntes.json
  - emmagatzema la bateria completa de preguntes i la seva estructura
  - cada element inclou:
    - id
    - pregunta
    - resposta_correcta
    - respostes_incorrectes
    - imatge

- respostes.json
  - arxiu auxiliar per retornar respostes o dades addicionals del sistema

- package.json
  - dependències i scripts del backend

### frontend/

La carpeta frontend conté la part visible del joc.

- index.html
  - defineix el login i la zona del quiz
  - inclou un panell per mostrar la pregunta actual i el marcador

- script.js
  - controla el flux del joc
  - fa fetch al backend
  - guarda la sessió de l'usuari
  - renderitza preguntes i opcions
  - porta el compte de les respostes i del progrés

- style.css
  - estil simple i funcional
  - panells centrats, botons d'acció i ocultació de seccions

- img/
  - imatges que acompanyen cada pregunta sobre marques i productes

## Com funciona l'aplicació

### 1. Login

L'usuari introdueix un nom i una contrasenya al formulari del login. La informació s'envia al backend mitjançant una petició POST a /login.

Si les dades són vàlides, el servidor crea una sessió i retorna un sessionId. Aquest identificador es guarda a localStorage per mantenir la sessió de l'usuari al navegador.

### 2. Generació de la partida

Quan l'usuari entra al quiz, el frontend sol·licita les preguntes a l'endpoint /preguntes, enviant el sessionId com a capçalera.

El backend:

- obté la llista de preguntes
- barreja l'array amb Math.random()
- selecciona un total de 10 preguntes
- recorre cada pregunta per crear una versió amb respostes desordenades
- retorna el resultat al client en format JSON

### 3. Renderització de la pregunta

El client rep el llistat de preguntes i les guarda a l'estructura d'estat del joc. A continuació, renderitza la primera pregunta amb:

- títol de la pregunta
- imatge associada
- quatre opcions en botons

### 4. Resposta de l'usuari

Quan l'usuari prem una resposta, l'aplicació:

- guarda la resposta elegida a l'array de respostes de l'usuari
- avança al següent índex de la pregunta
- torna a renderitzar la següent pregunta

Quan finalitza la llista, apareix l'estat final de la partida.

## Flux tècnic

La comunicació entre client i servidor es basa en peticions HTTP:

- POST /login
- GET /session
- GET /preguntes
- GET /respostes

La sessió es gestiona en memòria des d'un Map del backend. Això permet identificar l'usuari sense persistència real en base de dades, tot i que no és la solució més segura per a producció.

## Estil de desenvolupament

El projecte es presenta amb un enfocament molt didàctic i minimalista. La prioritat és que el flux complet del joc sigui fàcil de seguir i entendre:

- frontend senzill
- sense frameworks complexos
- lògica clara en JavaScript
- dades externes en JSON
- separació funcional entre servidor i client

Aquest estil fa que el projecte sigui ideal com a base d'aprenentatge per practicar conceptes bàsics d'aplicació web amb arquitectura client-servidor.

## Punts de millora

El projecte ja té una base funcional, però es pot ampliar amb diverses millores:

- puntuació total final
- comptador de preguntes encertades i fallades
- sistema de temps per pregunta
- pantalla de resultats amb resum visual
- millor gestió d'errors i validacions
- persistència d'usuaris o ranking
- disseny més atractiu amb estils moderns
- ús de base de dades per a emmagatzematge real de partides

## Resum

El projecte funciona com un quiz de marques amb un backend Express senzill, un frontend estàtic i una estructura modular bàsica. El seu objectiu principal és demostrar com es connecten client, servidor i dades per crear una aplicació interactiva amb flux d'autenticació i preguntes dinàmiques.

---

Documentació tècnica del joc de preguntes de marques.
