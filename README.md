# Navidad - Villa del Polo Norte

Esta versión tiene el JavaScript principal embebido en `index.html`, para que `index.html` pueda abrirse directamente con `file://` sin intentar cargar `js/app.js`.

- En `file://`: usa una villa 3D procedural sin cargar GLB locales.
- En GitHub Pages/http: puede cargar los modelos GLB del directorio `assets`.
- Three.js se carga desde jsDelivr, por lo que se requiere Internet.
- Incluye Tierra, atmósfera, nubes, estrellas fugaces, villa, tren, renos e interacción.
