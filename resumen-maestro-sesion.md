# 📚 Resumen Maestro — Sesión completa
### Legacy Luxury Limo Corp · Meta Ads, Pixel, Embudo de Reservas y Creativo
**Fecha:** 9 de junio de 2026 · **Cuenta Meta:** `act_1605540013677688` · **Business:** Legacy Luxury Limo Corp (`1038396061354237`)

---

## 0. Índice
1. Objetivo y alcance
2. Campañas Meta Ads (reporte inicial)
3. El Pixel de Meta (diagnóstico)
4. El embudo real y la corrección clave
5. Datos duros (logs del repo + Gmail)
6. Accesos y limitaciones del entorno (n8n, red, Motion)
7. Análisis de creativo (hook, retención, demografía)
8. Cambios de código realizados (repo legaluxlimo)
9. Hallazgos de seguridad
10. Documentos creados
11. Diagnóstico final: por qué no hay reservas
12. Pendientes y próximos pasos

---

## 1. Objetivo y alcance
Arrancó como un **reporte de campañas Meta Ads activas vía Pipeboard MCP** y evolucionó hacia resolver la pregunta de fondo: **por qué con gasto en ads no hay ni una sola reserva real.** En el camino se diagnosticó el pixel, el embudo, la entrega de correos y el creativo, y se dejó el pixel listo en una rama.

**Repos involucrados:**
- `legacyluxurylimos/github-mcp-remote` → rama `claude/meta-ads-pipeboard-report-0g9e3e` (documentos/reportes).
- `legacyluxurylimos/legaluxlimo` → rama `claude/meta-pixel-install` (código del sitio).

---

## 2. Campañas Meta Ads

| Campaña | Estado | Notas |
|---|---|---|
| **Mundial 2026 — Legacy Limo** | 🟢 ACTIVA | Objetivo Tráfico (LINK_CLICKS), optimizada a **Landing Page Views** |
| **General NJ — Legacy Limo** | ⏸️ PAUSADA | Sin entrega, 0 datos |

**Métricas Mundial 2026 (vida):** Gasto ~$30–34 · Reach ~3.7K · Impresiones ~4,700–5,150 · Clics (all) ~781 · CTR ~16.5% · CPC ~$0.04 · Frecuencia 1.30 · **Landing Page Views ~334–339** ($0.10 c/u) · **Reservas: 0**.

**Placement:** Feed domina (~89% gasto, CTR ~18%). Instagram rinde mal (CTR ~5.7%). Un solo creativo: "Reel Mundial MetLife" (CTA *Book Travel*).

---

## 3. El Pixel de Meta
- **Pixel oficial del negocio:** `532463836280153` ("Legacy Luxury Limo Corp - Pixel").
- En Events Manager hay **2 datasets y AMBOS en 0 eventos** ("Never received events").
- Búsqueda en TODO el repo `legaluxlimo` de `fbq`/`fbevents`/`connect.facebook.net` → **0 coincidencias**.
- `index.html`, `booking.html`, `20off.html` → **ninguno tenía pixel**.
- Único rastro Meta: `fb:app_id 1527742598685099` (App ID, **no** Pixel ID) y `meta-webhook.php` (bot de Messenger/IG, no pixel).
- **Conclusión:** NO había pixel instalado. Los "334 LPV" venían de la **medición por clic de Meta**, no de un pixel real → sin tracking, sin remarketing, sin optimización a conversión.

---

## 4. El embudo real y la corrección clave
- **Corrección:** al inicio se dedujo (mal) que el anuncio iba a la página de reserva. El usuario confirmó (con captura) que **el anuncio va a `book.legaluxlimo.com/20off`** = el **formulario de captura** del 20%. ✔️
- Embudo real: **Anuncio → `/20off` (form) → POST a webhook n8n (`/webhook/20off-lead`) → "Check Your Email"**.
- Camino aparte: **`index.html`** (cotización) → botón **"Reserve Now"** → `booking.html` → pago (Stripe/Clover). *No es por donde entra el anuncio.*

---

## 5. Datos duros (logs del repo + Gmail)
**Logs de reserva (repo):**
- `counters.json` → **`conf: 0`** (cero reservas confirmadas), `inv: 33`.
- `invoice-log.txt` → casi todas **$0.00**, correos de **prueba del dueño** (`jrosales0601@gmail.com`, etc.). Última actividad **19-may** (antes de la campaña). Aviso recurrente: `customer not resolved`. Dos procesadores mezclados: **Stripe y Clover**.

**Gmail (`jrosales0601@gmail.com`):**
- Correos "Your 20% Discount Code" → solo a sí mismo, marcados **"(TEST)"** → 0 leads reales.
- Reservas confirmadas (abril) → todas **pruebas**.
- ⚠️ Rebotes (`mailer-daemon`: *"Send mail as is misconfigured"*) en correos enviados por **Gmail "send as" `info@legaluxlimo.com`** (reportes diarios + tests).
- **Corrección del usuario:** los correos del cliente salen por **SendGrid (vía n8n)**, no por Gmail → no se puede afirmar que la entrega al cliente esté rota; se verifica en **SendGrid Activity** (no accesible desde aquí).
- Dato extra: hay un automatismo de **reporte diario de Ads** (incluye Google Ads cuenta 178-768-8911) que también rebota.

---

## 6. Accesos y limitaciones del entorno
- **n8n:** ❌ NO hay MCP de n8n en esta sesión (verificado). El Claude de la PC y este Claude en la nube son entornos **aislados**; credenciales no se comparten. Se entregó guía para conectarlo (MCP `n8n-mcp` + secretos `N8N_API_URL`/`N8N_API_KEY` + allowlist de red + reiniciar). El usuario eligió, por ahora, no montarlo en esta sesión.
- **Sitio en vivo:** ❌ la red del entorno bloquea egress (`host_not_allowed`) → no se puede abrir `book.legaluxlimo.com`, n8n ni SendGrid.
- **Repo `legaluxlimo`:** ✔️ accesible (lectura/escritura) vía servidor GitHub MCP secundario; el proxy git local solo autoriza `github-mcp-remote`.
- **Motion:** conectado pero **vacío** (`organizations: []`, sin workspace ni Meta vinculado) → no se pudo usar; los datos de creativo se sacaron directo de Meta vía Pipeboard.
- **MCP conectados:** Meta Ads (Pipeboard), GitHub, Motion, Canva, Google Calendar, Google Drive, Gmail, Firecrawl.

---

## 7. Análisis de creativo — "Reel Mundial MetLife" (datos preliminares, ~$33)
**Hook & retención** (5,150 impresiones · 880 reproducciones de 3s):
- **Hook rate (thumbstop): 17%** → promedio; ~83% sigue de largo (bueno sería 25–30%+).
- **ThruPlay:** 230 (~4.5%).
- Retención (de los 880 que arrancaron): 25%→85% · **50%→47% (gran bajón)** · 75%→34% · 95%→27% · 100%→25%.
- **Leak principal entre el 25% y 50% del video.**

**Demografía (edad):**
| Edad | Impres. | CTR | Gasto |
|---|---|---|---|
| 25–34 | 967 | 13.0% | $5.71 |
| 35–44 | 2,623 | 16.8% | $16.52 |
| 45–54 | 1,463 | **18.9%** | $10.45 |
| 55–64 | 97 | 12.4% | $0.67 |

→ Núcleo que mejor responde: **35–54**. (Género no devuelto por Meta en la consulta.)

**Lectura:** el creativo hace su trabajo (atención + clics). El problema de "0 reservas" **no es el creativo**, es el embudo después del clic. Mejoras posibles: reforzar el hook (seg 1–2) y arreglar la mitad del video; inclinar targeting a 35–54.

---

## 8. Cambios de código realizados (repo `legaluxlimo`, rama `claude/meta-pixel-install`)
**Método:** aditivo, sin tocar lógica existente. NO se hizo deploy (el usuario despliega a GoDaddy manualmente).

| Archivo | Commit | Cambio |
|---|---|---|
| `book/20off.html` | `da1d757` | Pixel `532463836280153` + `PageView` en `<head>`; evento **`Lead`** vía `MutationObserver` sobre `#success-view` (solo dispara en envío exitoso). **Form y webhook n8n intactos** (verificado byte a byte). |
| `book/meta-pixel.js` | `7adb866` | **Archivo nuevo:** loader externo → `PageView` + **`InitiateCheckout`** (al clic en "Proceed to Payment / Proceder al Pago"). |

**Pendiente de activar (Opción A elegida por el usuario):** agregar en `book/index.html` y `book/booking.html`, **antes de `</head>`**:
```html
<script src="/meta-pixel.js"></script>
```
- `index.html` → PageView. `booking.html` → PageView + InitiateCheckout.
- NO se reescribieron esos 2 archivos por riesgo (index tiene una línea de 96K chars; booking son 1,458 líneas de React de checkout).

---

## 9. Hallazgos de seguridad (URGENTE — independientes del pixel)
1. **`book/meta-webhook.php`** → credenciales en texto plano commiteadas: **Anthropic API key** (`sk-ant-…`), **Facebook Page token**, **Instagram token**, verify token. → **Rotar todo.**
2. **`book/booking.html`** → usa `pk_live_…` (publicable, OK) pero lee una Stripe key de `sessionStorage` (`stripe_key_temp`) y llama endpoints **secretos** de Stripe (`/v1/customers`, `/v1/payment_intents`). Si esa key es secreta, está **expuesta en el navegador**. → **Revisar.**

---

## 10. Documentos creados (repo `github-mcp-remote`, rama `claude/meta-ads-pipeboard-report-0g9e3e`)
| Archivo | Commit | Contenido |
|---|---|---|
| `reporte-meta-ads.md` | `a73f29f` | Reporte de campañas + análisis + 3 acciones |
| `reporte-pixel-meta.md` | `1f65579` | Diagnóstico del pixel (532 muerto, etc.) |
| `resumen-diagnostico-legaluxlimo.md` | `5ea7580` | Resumen ejecutivo del diagnóstico |
| `instalacion-meta-pixel.md` | `a04c878` | Guía de instalación del pixel (Opción A) |
| `resumen-maestro-sesion.md` | *(este)* | Resumen completo de toda la sesión |

---

## 11. Diagnóstico final: por qué $ en ads → 334 visitas → 0 reservas
Cadena de fallos acumulados:
1. **Campaña optimizada a "Landing Page Views/clics", no a Leads** → trae curiosos, no compradores.
2. **No había pixel** → no se medía cuántos llenan el form, y Meta no podía buscar gente que convierte.
3. **Verificación pendiente** de si los leads reales llegan (n8n) y si el código 20% se entrega (SendGrid).
4. **Sin medición = sin remarketing ni seguimiento optimizado.**
5. Históricamente, el sistema **solo registra pruebas del dueño** (0 reservas reales, conf:0).

El creativo y el clic funcionan; **el dinero se pierde después del clic.**

---

## 12. Pendientes y próximos pasos (orden por impacto)
1. **Desplegar el pixel a GoDaddy** (Opción A): subir `meta-pixel.js` + la línea `<script>` en `index.html` y `booking.html`; `20off.html` ya viene listo en la rama. Verificar en Events Manager.
2. **Verificar la entrega de leads/correos:** ejecuciones del webhook `20off-lead` en n8n + **SendGrid Activity** (¿llegan/abren los códigos 20%?).
3. **Cambiar objetivo de campaña** de Landing Page Views → **Leads** (cuando el pixel tenga datos).
4. **Remarketing** a quienes visitaron y no convirtieron.
5. **Seguimiento/cierre** de cada lead.
6. **Rotar credenciales expuestas** (`meta-webhook.php`) y revisar la Stripe key en `booking.html`.
7. **Creativo:** preparar 2º creativo (mejor hook, estructura más corta), targeting 35–54.
8. (Opcional) Conectar MCP de n8n al entorno + allowlist, para diagnóstico directo.

---

*Notas: los logs del repo pueden ir levemente desfasados del servidor en vivo. No se hizo ningún deploy. Todo el código nuevo está en la rama `claude/meta-pixel-install` y todos los reportes en `claude/meta-ads-pipeboard-report-0g9e3e`.*
