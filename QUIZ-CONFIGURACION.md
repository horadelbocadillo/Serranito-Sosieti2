# Configuracion del Quiz del Serranito Perfecto

Este documento contiene toda la configuracion editable del quiz para revision.

---

## ESTRUCTURA ACTUAL DEL QUIZ (5 pasos)

| Paso | Titulo | Tipo | Obligatorio |
|------|--------|------|-------------|
| 1 | Carne | Seleccion unica | Si |
| 2 | Pan | Seleccion unica | Si |
| 3 | Otros ingredientes | Seleccion multiple | No |
| 4 | Extras | Seleccion multiple | No |


---

## PASO 1: La carne

**Titulo actual:** "Elige tu proteina"
**Subtitulo actual:** "La base de todo buen serranito"

| ID | Nombre | Emoji | Descripcion |
|----|--------|-------|-------------|
| lomo | Lomo de cerdo | 🐷 | Del Ibérico |
| pollo | Pollo | 🐔 | Mas ligero |
| ternera | Ternera | 🐄 | Pa los carnivoros |

---

## PASO 2: El Pan

**Titulo actual:** "Elige tu pan"
**Subtitulo actual:** "El abrazo perfecto para tu serranito"

| ID | Nombre | Emoji | Descripcion |
|----|--------|-------|-------------|
| viena | Pan de Viena | 🥖 | Crujiente por fuera, tierno por dentro |
| brioche | Pan Brioche | 🍞 | Suave y mantecoso |

---

## PASO 3: Los otros ingredientes

**Titulo actual:** "Lo que no puede faltar"
**Subtitulo actual:** "Los acompanantes de siempre"
**Tipo:** Seleccion multiple (opcional)

| ID | Nombre | Emoji | Descripcion |
|----|--------|-------|-------------|
| tomate | Tomate | 🍅 | Frescura mediterranea |
| pimiento | Pimiento frito | 🫑 | El toque andaluz |
| jamon | Jamon Serrano | 🥓 | Porque si |
| patatas| Patatas fritas | 🥓 | De las de verdad |

---

## PASO 4: Extras

**Titulo actual:** "Los más polémicos"
**Subtitulo actual:** "Aqui es donde se pone interesante..."
**Tipo:** Seleccion multiple (opcional)

| ID | Nombre | Emoji | Descripcion |
|----|--------|-------|-------------|
| mayonesa | Mayonesa | 🥚 | Clasica y cremosa |
| alioli | Alioli | 🧄 | Con ajo, claro |
| mojo | Mojo | 🌶️ | Picante canario |
| tortilla | Tortilla francesa | 🍳 | Controversial |
| patatas_dentro | Patatas dentro | 🥔 | El debate eterno |
| sin_guarnicion | Sin guarnicion | ❌ | Minimalista |

---



---

## PANTALLA DE RESULTADO

**Titulo:** "Tu Serranito Perfecto"
**Subtitulo:** "Asi es como te gusta el serranito"

### Generacion de nombres (automatico segun ingredientes):

- **Carne de lomo** → "El Clasico"
- **Carne de pollo** → "Te queremos de todas formas"
- **Carne de ternera** → "Lo tuyo es gourmet"

**Modificadores del nombre:**
- Si incluye jamon, tomate, pimiento frito → añade "de toda la vida de Dió"
- Si incluye patatas_dentro → añade "piensas fuera de la caja"
- Si incluye tortilla → añade "ERROR"
- Si incluye mojo → añade "plus Picante"
- Si incluye alioli → añade "bueno, vale"
- Si incluye mayonesa → añade "bueno, vale"
- Si no hay modificadores y pan brioche → añade "qué locura es esta?!"
- Si no hay modificadores y pan viena → añade "de sevillanas maneras"

### Descripcion generada (ejemplo):

```
Tu serranito es "El Clasico Jamon".
Un jugoso lomo de cerdo a la plancha
abrazado por un crujiente pan de Viena
con tomate fresco, pimiento frito al punto, jamon iberico
Acompañado de unas patatas fritas bien crujientes.
```

### Textos de descripcion por ingrediente:

**Carnes:**
- lomo: "Un jugoso lomo de cerdo a la plancha"
- pollo: "Pechuga de pollo bien doradita"
- ternera: "Ternera tierna y sabrosa"

**Panes:**
- viena: "abrazado por un crujiente pan de Viena"
- brioche: "envuelto en un suave pan brioche"

**Los otros ingredientes:**
- tomate: "tomate fresco"
- pimiento: "pimiento frito al punto"
- jamon: "jamon iberico"
- patatas_fritas: "Acompañado de unas patatas fritas bien crujientes."

**Los extras:**
- mayonesa: "mayonesa casera"
- alioli: "alioli potente"
- mojo: "mojo picon"
- tortilla: "tortilla francesa bien cuajada"
- patatas_dentro: "patatas crujientes dentro"
- sin_guarnicion: "Solo, que el serranito ya es suficiente."



### Mensajes finales segun personalidad:

**COMBINACIONES DE EXTRAS (puedes elegir varios):**
- mayonesa
- alioli
- mojo
- tortilla
- patatas_dentro
- sin_guarnicion

**PATRONES ACTUALES:**
| Condicion | Mensaje actual |
|-----------|----------------|
| patatas_dentro | "Eres de los valientes, piensas fuera de la caja."
|tortilla | "Puedes ser expulsado en cualquier momento"
|alioli | "bueno, vale..."
|mayonesa |"bueno, vale"
|mojo |"bueno, vale"
 |

| Sin otros ingredientes + sin extras | "Purista y clasico, respetas la tradicion." |
| 3 o mas extras | "No te cortas un pelo,Tienes hambre, eh?." |

**TODOS LOS PATRONES POSIBLES QUE PUEDES DEFINIR:**

| Patron | Descripcion | Mensaje (escribe aqui) |
|--------|-------------|------------------------|
| Solo mayonesa | bueno, vale... | |
| Solo alioli | espanta Drácula | |
| Solo mojo | con ascendente isleño | |
| Solo tortilla | MAL, MUY MAL... Puedes ser expulsado en cualquier momento| |
| Solo patatas_dentro | Patatas lover | |
| Solo sin_guarnicion | Minimalista | |
| mayonesa + alioli | Más de lo mismo con ajo | |
| mayonesa + mojo | ¿esto está bueno? | |
| alioli + mojo | Ajo picante | |
| tortilla + patatas_dentro | No te entiendo| |
| patatas_dentro + alioli | sin miedo | |
| Todos los ingredientes basicos | Completo clasico | |
| Sin ingredientes basicos | Minimalista total | |
| 1 extra | Toque personal | |
| 2 extras | Personalizado | |
| 3+ extras | Maximalista | |
| Sin extras | Purista | |

**COMBINACIONES POR CARNE:**
| Carne | Patron de extras | Mensaje (escribe aqui) |
|-------|------------------|------------------------|
| lomo + sin extras | Clasico puro | |
| lomo + alioli | Clasico sin aliento | |
| lomo + todo | No te entiendo | |
| pollo + sin extras | Te lo perdono | |
| pollo + alioli | No sé qué decirte | |
| ternera + todo | Tu Serranito es muy caro | |

**COMBINACIONES POR PAN:**
| Pan | Patron | Mensaje (escribe aqui) |
|-----|--------|------------------------|
| viena + clasico | Tradicional sevillano | |
| brioche + extras | Demasiadas modernidades | |

---

## BOTONES EN PANTALLA DE RESULTADO

1. **"Repetir test"** - Reinicia el quiz
2. **"Compartir en el feed"** - Publica el resultado como post
3. **"Continuar al feed"** - Va a la pagina principal (/)

---

## ERRORES REPORTADOS POR USUARIO

1. **Paso 3 (Extras):** Tomate, pimiento y jamon son INGREDIENTES BASICOS, no extras opcionales
2. **Paso 4:** No llamarlos "polemicos" (da pistas), sino "Extras"
3. **Paso 5 (Guarnicion):** Las patatas fritas son parte de los ingredientes basicos
4. **"Sin guarnicion"** deberia estar en la seccion de extras
5. **Boton "Continuar al feed"** no funciona, vuelve al inicio del quiz

---

## PROPUESTA DE NUEVA ESTRUCTURA

### Ingredientes BASICOS (siempre incluidos, no se eligen):
- Tomate
- Pimiento frito
- Jamon serrano
- Patatas fritas (guarnicion)

### Pasos del quiz propuestos:
1. **Proteina** (eleccion obligatoria): lomo/pollo/ternera
2. **Pan** (eleccion obligatoria): viena/brioche
3. **Extras** (eleccion multiple opcional): mayonesa, alioli, mojo, tortilla francesa, patatas dentro, SIN GUARNICION

---
