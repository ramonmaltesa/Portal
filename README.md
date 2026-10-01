# Portal de ofertas laborales

Aplicación web que reúne vacantes de:

- Chilquinta
- Esval y Aguas del Valle
- Universidad Técnica Federico Santa María (USM)

Permite actualizar las ofertas desde sus portales oficiales, buscar por cargo, empresa o ciudad, filtrar por área/carrera y fuente, revisar el detalle y guardar favoritas en el navegador.

## Ejecutar localmente

Requiere Node.js 22 o superior.

```bash
npm install
npm run dev
```

Luego abre `http://localhost:5173`.

## Compilar

```bash
npm run build
```

## Estructura principal

- `app/page.tsx`: interfaz, filtros, detalle y favoritos.
- `app/api/jobs/route.ts`: actualización de ofertas desde las tres fuentes.
- `app/globals.css`: diseño adaptable para computador y móvil.

## Consideración de publicación

El código está alojado en GitHub. Como la actualización de ofertas usa una ruta de servidor, el proyecto debe desplegarse en un servicio compatible con aplicaciones Node/Workers; GitHub Pages por sí solo solo sirve archivos estáticos.
