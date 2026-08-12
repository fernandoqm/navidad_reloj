# 🎄 Navidad desde Costa Rica · Aldea del Polo Norte

Experiencia web interactiva para GitHub Pages.

## Características

- 🌎 Tierra 3D con textura realista.
- ☁️ Capa de nubes.
- ✨ Campo de estrellas.
- ❄️ Aldea navideña estilizada en el Polo Norte.
- 🎅 Fábrica, taller de elfos, gimnasio de renos y casa de Santa.
- ⏱️ Cuenta regresiva real hasta el 25 de diciembre de 2026.
- 🇨🇷 Mensajes con referencias a Costa Rica.
- 💬 Noticias graciosas que cambian automáticamente.
- 🖱️ Cámara interactiva con mouse/touch.
- 📱 Diseño responsive.
- 🚀 Sin backend: preparado para GitHub Pages.

## Publicarlo en GitHub Pages

1. Crea un repositorio, por ejemplo `navidad-polo-norte`.
2. Sube todo el contenido de esta carpeta manteniendo la estructura.
3. En GitHub entra a **Settings → Pages**.
4. En **Build and deployment**, selecciona:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
5. Guarda y espera a que GitHub publique el sitio.

## Dependencias

Three.js y OrbitControls se cargan desde jsDelivr. Las texturas de la Tierra se cargan desde los ejemplos públicos de Three.js.

Si quieres que el sitio sea completamente independiente de servicios externos, se pueden descargar y versionar las texturas y las librerías dentro de `assets/` en una siguiente versión.

## Próxima evolución recomendada

- Crear una ciudad del Polo Norte mucho más detallada con modelos 3D.
- Añadir renos animados.
- Añadir tren navideño en movimiento.
- Añadir nieve en primer plano.
- Hacer que la cámara pueda acercarse automáticamente a cada edificio.
- Agregar una visita guiada.
- Añadir un mapa nocturno de Costa Rica.
- Añadir audio navideño opcional.
- Crear una ruta de vuelo de Santa desde el Polo Norte hacia Costa Rica.


## Probarlo en Windows sin GitHub

No abras `index.html` con doble clic. Chrome bloquea los módulos JavaScript y las texturas externas cuando la página usa `file://`.

### Método fácil

1. Asegúrate de tener Python instalado.
2. Haz doble clic en `abrir-local.bat`.
3. Se abrirá:
   `http://localhost:8000/`
4. Mantén abierta la ventana negra mientras pruebas el sitio.

### Si Python no está instalado

Puedes abrir una terminal dentro de esta carpeta y ejecutar:

```bash
py -m http.server 8000
```

Luego entra en:

`http://localhost:8000/`

En GitHub Pages no tendrás este problema porque el sitio se sirve mediante `https://`.
