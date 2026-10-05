# Documentació de disseny i prototipatge

## Iteració 1 — Wireframe bàsic i flux de pantalles (mobile)

El prototip inicial del producte es va plantejar en format mobile per definir el flux principal de la pantalla de login i la pantalla de pregunta.

Enllaç al Penpot del wireframe bàsic i flux de pantalles:

- [Penpot – wireframe i flux del quiz mobile](https://penpot.app/)

L'estructura prevista del flux és la següent:

1. Pantalla de login
2. Inici de la partida
3. Pantalla de pregunta amb imatge i opcions
4. Resposta de l'usuari
5. Pantalla de resultat / resum final

Aquest primer wireframe serveix per validar la navegació, l'ordre de les accions i la jerarquia visual de la informació.

## Iteració 2 — Mockup elaborat amb els principis CRAP

El mockup de la pregunta es va convertir en una proposta visual més acurada aplicant els principis de CRAP:

- Contrast: reforçar la rellevància de la pregunta i la resposta correcta mitjançant colors i pes visual.
- Repetició: mantenir un mateix patró de botons, marges i tipografia al llarg de la pantalla.
- Alineació: disposició ordenada dels elements per millorar la lectura i el flux visual.
- Proximitat: agrupar la informació relacionada perquè el usuari entengui ràpidament què és cada bloc.

### Principis aplicats al mockup

- Proporcions i disposició dels elements: la pregunta ocupa la zona principal, les respostes es col·loquen sota i es mantenen alineades en una graella clara.
- Tipografia: es prioritza una tipografia neta i llegible, amb diferència de pes entre el títol de la pregunta i les opcions.
- 3 colors + blanc + negre/gris: la pantalla fa servir una paleta reduïda i coherent, evitant massa varietat visual.
- Ombres, marges i bordes: es fan servir separacions i límits subtils per reforçar la lectura sense saturar la interfície.

La paleta de colors es basa en una selecció de tres colors de la proposta popular de Coolors:

- [Paleta de 3 colors – Coolors](https://coolors.co/palettes/popular/3%20colors)

Aquesta paleta s'utilitza per definir els colors principals del component de pregunta i les respostes.

## Iteració 3 — Variables CSS

Els colors del disseny es defineixen com a variables CSS perquè siguin reutilitzables i fàcils de mantenir.

```css
:root {
  --pregunta: #f4efe8;
  --divisor: #d9c7b1;
  --fons: #fffaf5;
}
```

Amb els noms exactes requerits:

- `--pregunta`: color de fons de la zona de la pregunta
- `--divisor`: color de l'element separador de les diverses respostes
- `--fons`: color de fons de la zona de les respostes

Aquest enfocament permet modificar fàcilment la identitat visual del prototip sense tocar tota la estructura HTML.

## Iteració 4 — Prototip i CSS Grid

La pantalla del mockup es converteix en un prototip funcional i es dissenya amb CSS Grid per obtenir una distribució coherent i adaptativa.

### Distribució principal

Es fa servir una estructura de grid amb `grid-template-areas` i `grid-template-columns` per definir els blocs principals de la pantalla.

Exemple conceptual:

```css
.quiz-layout {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-areas:
    "header"
    "question"
    "answers"
    "footer";
}
```

I per als botons de resposta:

```css
.answers-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
```

Això permet:

- estructurar la pregunta, els botons i el footer de manera clara
- distribuir les opcions en una graella equilibrada
- crear una resolució mobile neta i ràpida de llegir

## Framework utilitzat

El projecte fa servir el framework CSS POCSS com a base per la composició visual i els components bàsics d'interfície.

- POCSS: framework utilitzat per la definició visual del front-end
- CSS Grid: aplicat per la distribució d'elements principals i botons de resposta
- HTML i JavaScript: estructuració i lògica de la interacció

## Resum

Aquest document recull el procés de disseny del quiz en les diferents iteracions:

- iteració 1: wireframe i flux mobile
- iteració 2: mockup amb CRAP i paleta de colors
- iteració 3: variables CSS amb els noms sol·licitats
- iteració 4: prototip funcional amb CSS Grid i `grid-template-areas`

La idea final és tenir una interfície coherent, clara i adaptable a dispositius mòbils, mantinguda amb una paleta i una estructura visual simple i professional.

---

Documentació del disseny, el prototipatge i la implementació visual del projecte.
