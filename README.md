# Control de Inventario — SILOCOM C.A.

Dashboard web para consultar inventarios de tarjetas SIM, routers, flota y Sensorizeit. Está desarrollado con React 19, TypeScript, Vite y Tailwind CSS.

## Arquitectura

- **Frontend:** aplicación React/Vite en `src/`, con vistas, filtros, KPI y dashboards por tipo de inventario.
- **Integración de datos:** `src/services/googleSheetsService.ts` lee fuentes de Google Sheets desde el navegador. Admite CSV publicado, Google Sheets API v4 y endpoints públicos GViz/export.
- **Configuración:** `src/config/sheetsConfig.ts` aplica variables `VITE_*` opcionales y valores predeterminados. La interfaz permite configurar cinco espacios de datos (SIM, router, flota, Sensorizeit y otros); la configuración del usuario se conserva en el almacenamiento local del navegador.
- **Procesamiento:** `src/utils/` contiene parsers CSV y de respuestas de Sheets. `src/data/` contiene datos de ejemplo usados para inicializar la interfaz.
- **Sin backend de aplicación:** este repositorio no contiene un servidor Express, endpoints `/api` ni código de Google Apps Script. La lectura de datos se realiza directamente desde el navegador.

## Requisitos y desarrollo local

Se requiere Node.js y npm.

```bash
npm install
npm run dev
```

Vite mostrará la dirección local disponible. Para comprobar tipos y compilar:

```bash
npm run lint
npm run build
```

El build estático se genera en `dist/`. También existe `bun.lock` para instalaciones con Bun.

## Conectar Google Sheets

Puedes establecer las conexiones en la interfaz de la aplicación o preconfigurar URLs mediante un archivo `.env.local` en la raíz:

```env
VITE_SIM_SHEET_URL=
VITE_ROUTER_SHEET_URL=
VITE_FLOTA_SHEET_URL=
VITE_SENSORIZEIT_SHEET_URL=
VITE_GOOGLE_SHEETS_API_KEY=
```

Las URLs y la clave API son opcionales: si no se proporciona una clave, el servicio intenta leer hojas accesibles mediante URLs públicas CSV/GViz/export. Para usar Google Sheets API v4, la hoja y la API deben permitir el acceso necesario para la clave configurada.

Los nombres predeterminados de las hojas son `SIM`, `ROUTER`, `INV FLOTA`, `INV SENSORIZEIT` y `OTROS`. Las conexiones se guardan en el navegador del usuario; configurarlas en una sesión no las distribuye automáticamente a otros usuarios. También se pueden establecer variables `VITE_*` en el proveedor de compilación para definir valores iniciales compartidos por el build.

## Despliegue

Se puede desplegar como aplicación estática en Vercel u otro proveedor compatible con Vite:

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Variables opcionales:** las indicadas en la sección de conexión a Google Sheets.

No se requiere `GEMINI_API_KEY`: la aplicación no utiliza Gemini. Las variables `VITE_*`, incluida `VITE_GOOGLE_SHEETS_API_KEY`, quedan incorporadas en el código del navegador durante la compilación. No incluyas credenciales privadas ahí; restringe las claves API según las capacidades del proveedor.

## Estructura principal

```text
├── src/
│   ├── components/       # Dashboards, filtros, KPI y configuración de Sheets
│   ├── config/           # Configuración de conexiones y hojas
│   ├── data/             # Datos de ejemplo
│   ├── services/         # Lectura de Google Sheets
│   ├── utils/            # Parsers y utilidades CSV
│   ├── App.tsx
│   ├── types.ts
│   └── main.tsx
├── package.json
├── bun.lock
└── vite.config.ts
```
