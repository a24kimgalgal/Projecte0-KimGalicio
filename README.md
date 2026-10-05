# Quiz de marques

Projecte web de tipus quiz basat en preguntes sobre marques, productes i empreses conegudes del món de la tecnologia, la moda, l'alimentació, l'esport i el retail. La idea del joc és senzilla: l'usuari inicia sessió, es genera una partida aleatòria i respon una sèrie de preguntes de resposta múltiple amb imatge i temporització visual molt bàsica.

**Autor:** Kim Zairyl Galicio Lamar de 2do de DAW

## Descripció

Aquest projecte combina un frontend lleuger en HTML, CSS i JavaScript amb un backend en Node.js i Express. Les preguntes es gestionen des d'arxius JSON i es serveixen al client de forma dinàmica per generar partides diferents cada vegada.

L'objectiu principal és practicar conceptes de:

- desenvolupament frontend amb DOM i esdeveniments
- ús de fetch per a la comunicació client-servidor
- emmagatzematge de sessió amb sessionId
- gestió de dades JSON en backend
- estructura moderna d'aplicació web senzilla

## Funcionalitats

- Login bàsic amb correu i contrasenya.
- Possibilitat d'entrar com a usuari normal o com a administrador utilitzant el compte `admin` i el correu `admin@gmail.com`.
- Generació de sessió per usuari.
- Obtenció de preguntes aleatòries des del backend.
- Mescla d'opcions per tal que la resposta correcta aparegui en posicions diferents.
- Visualització d'una pregunta per vegada.
- Progrés de l'usuari durant la partida.
- Ús d'imatges associades a cada pregunta.
- Estructura preparada per ampliar-se amb puntuació final, temporitzador, estadístiques i millores d'UX.

## Tecnologies utilitzades

- HTML5
- CSS3
- JavaScript vanilla
- Node.js
- Express
- CORS
- UUID per a la generació de sessions
- JSON com a font de dades
- **Docker i Docker Compose** (per a la conteneïtzació i execució en entorn local)
- **GitHub Actions (CI/CD)** (per a la validació al fer merge i el desplegament automàtic)
- **Screen** (per a l'execució i manteniment del procés en el servidor de producció)

## Estructura del projecte

A continuació es mostra l'estructura real del repositori, incloent els directoris i fitxers que formen la base del sistema:

- `.`
  - `.env`: variables d'entorn per a la configuració de la base de dades i altres valors locals
  - `.gitignore`: fitxer de exclusions de Git
  - `docker-compose.dev.yml`: orquestració del entorn de desenvolupament local
  - `README.md`: documentació principal del projecte
  - `backend/`: aplicació Node.js / Express
  - `frontend/`: client web HTML, CSS i JavaScript
  - `doc/`: documentació addicional del projecte
  - `.github/workflows/`: workflows de CI/CD

- `backend/`
  - `app.js`: servidor principal amb endpoints de login, sessió, preguntes i flux de joc
  - `migrate.js`: script que crea les taules MySQL i importa les preguntes i respostes des de `preguntes.json`
  - `preguntes.json`: conjunt de preguntes del quiz amb imatges i respostes correctes/incorrectes
  - `respostes.json`: fitxer auxiliar de dades que complementa el flux de respostes
  - `package.json`: dependències i scripts del backend
  - `Dockerfile.dev`: configuració del contenidor de desenvolupament del backend
  - `config/`
    - `db.js`: connexió a MySQL mitjançant `mysql` i càrrega de variables d'entorn des de `.env`
  - `test/`
    - `api.preguntes.test.js`: validacions de les rutes i serveis de preguntes
    - `cd.test.js`: proves associades al flux de desplegament o integració continuada
    - `ci.test.js`: validacions de la configuració de CI
    - `edge-cases.test.js`: casos límit i comportaments inesperats
    - `respostes.flow.test.js`: proves del flux de respostes i lògica del joc

- `frontend/`
  - `index.html`: pàgina principal de l'aplicació
  - `admin.html`: panell d'administració amb funcionalitats especials per a l'usuari administrador
  - `script.js`: lògica principal del frontend i comunicació amb el backend
  - `admin.js`: lògica específica del panell d'administració
  - `style.css`: estils visuals del joc i del panell admin
  - `img/`: recursos gràfics, imatges de marques i elements visuals
  - `Dockerfile.dev`: configuració del contenidor del frontend

- `doc/`
  - `README.md`: documentació addicional i explicació del funcionament de l'aplicació

- `.github/workflows/`
  - `ci.yml`: workflow d'Integració Contínua
  - `cd.yml`: workflow de Desplegament Continu

## Com funciona

1. L'usuari entra a l'aplicació i omple el formulari de login. Pot decidir si entrar amb un compte d'usuari normal o amb el compte admin (`admin@gmail.com`).
2. El frontend envia les dades al backend mitjançant una petició POST a `/login`.
3. El servidor crea una sessió única i retorna un `sessionId` (juntament amb informació de rol si aplica).
4. El client guarda aquest identificador a `localStorage`.
5. Quan s'inicia la partida, el navegador sol·licita `/preguntes` amb el `sessionId`.
6. El backend barreja les preguntes, selecciona un conjunt i les retorna amb opcions aleatòries.
7. El frontend renderitza la primera pregunta i espera la resposta de l'usuari.
8. El flux continua amb la següent pregunta fins completar la partida.

## Proves i validació

El projecte inclou una bateria de proves automatitzades dins de `backend/test/` per validar diferents parts del flux:

- comprovació de les rutes i endpoints de l'API
- validació del flux de preguntes i respostes
- casos límit i errors inesperats
- verificació de la integració de CI/CD i del comportament d'administració

Per executar-les des de la carpeta `backend`, es pot fer:

```bash
npm test
```

Aquestes proves estan preparades per comprovar que el backend continua funcionant correctament després de canvis en la lògica del joc o de la API.

## Inici del projecte (Local)

Per arrencar el projecte en entorn local de desenvolupament, s'utilitza **Docker**. Això ens estalvia haver d'instal·lar les dependències localment de forma manual i permet aixecar el servei i el client d'una sola vegada.

Per aixecar els contenidors, executa la següent comanda des de l'arrel del projecte:

```bash
docker compose -f docker-compose.dev.yml up -d --build
```
*(També pots utilitzar `docker-compose` depenent de la teva versió).*

Un cop el procés finalitzi, l'aplicació web es podrà visualitzar a:

**http://localhost:40600**

### Apartats a localhost:40600

A l'accedir a l'adreça `http://localhost:40600`, l'usuari navegarà pels següents apartats:

- **Login:** La pantalla inicial on s'ha d'introduir un correu i contrasenya per començar a jugar. Pots provar a entrar com a administrador amb l'usuari `admin` / `admin@gmail.com`.
- **Admin Panel / Vistes Especials:** Si inicies sessió com a administrador, el sistema detectarà el compte `admin` i podràs accedir a funcionalitats exclusives, gestionant o monitoritzant dades. Si no, entraràs com a usuari regular a jugar el quiz.
- **Interfície de Quiz:** És la pantalla principal de joc. Aquí es mostren la imatge de la marca, el temporitzador, les 4 opcions de resposta possibles i la barra de progrés de les preguntes (ex: 1 de X).
- **Resultats:** Quan finalitza el quiz, es mostra una pantalla amb el resum de les teves respostes per veure quines marques has endevinat.

## Desplegament al Servidor (Producció) i CI/CD

El cicle de vida del projecte empra GitHub Actions per assegurar un flux de treball robust:
- **CI (Integració Contínua):** S'utilitza per testejar, lintar o validar el codi abans de permetre un *merge* cap a la branca principal.
- **CD (Desplegament Continu):** S'utilitza per a l'automatització del desplegament (`desplegamiento`) directament al servidor quan hi ha nous canvis.

És important remarcar que, tot i que localment utilitzem Docker per facilitar el desenvolupament, **en el servidor de producció no s'utilitza Docker**. L'execució al servidor es realitza de forma nativa gestionant el procés mitjançant comandaments de **`screen`**, que permeten mantenir el servidor Node en execució contínua en segon pla (en comptes de dependre de contenidors).

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
