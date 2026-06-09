# 📋 Resumen Ejecutivo — Diagnóstico Meta Ads + Embudo de Reservas
### Legacy Luxury Limo Corp · Cuenta `act_1605540013677688`
**Fecha:** 9 de junio de 2026

---

## 1. Punto de partida
Se pidió un reporte de las campañas Meta Ads activas vía Pipeboard MCP y, a partir de ahí, resolver por qué **no hay reservas reales** a pesar del gasto en publicidad. La investigación derivó en hallazgos de fondo sobre el pixel, el embudo y la entrega de correos.

---

## 2. Estado de las campañas (Meta Ads)

| Campaña | Estado | Notas |
|---|---|---|
| **Mundial 2026 — Legacy Limo** | 🟢 ACTIVA | Objetivo: Tráfico (LINK_CLICKS), optimizada a **Landing Page Views** |
| **General NJ — Legacy Limo** | ⏸️ PAUSADA | Sin entrega, 0 datos |

**Métricas Mundial 2026 (desde inicio):**
- Gasto: **$30.49** · Reach: **3.7K** · Impresiones: ~4,728
- Clics (all): **781** · Link clicks: ~431 · **CTR 16.5%** · **CPC $0.04**
- Frecuencia: **1.30** (sana, sin saturación)
- **Landing Page Views: 334** · Costo por LPV: **$0.10**
- **Reservas: 0**
- Placement ganador: **Feed** (~89% del gasto, CTR 18%). Instagram rinde mal (CTR 5.7%).
- Un solo creativo: "Reel Mundial MetLife" (CTA *Book Travel*).

---

## 3. El Pixel de Meta

- **Pixel oficial del negocio:** `532463836280153` ("Legacy Luxury Limo Corp - Pixel").
- En Events Manager existen **2 datasets** y **AMBOS están en 0 eventos** ("Never received events").
- **Conclusión:** NO hay ningún pixel instalado ni disparando en el sitio.
- Los "334 Landing Page Views" **no vienen de un pixel** — son la medición propia de Meta por clic. No hay tracking real (ni remarketing, ni conversiones, ni optimización fina).

### Verificación en el código (repo `legacyluxurylimos/legaluxlimo`)
Búsqueda en todo el repo de `fbq` / `fbevents` / `connect.facebook.net` → **0 coincidencias**.
- `index.html`, `booking.html`, `20off.html` → **ninguno tiene pixel**.
- Único identificador Meta: `fb:app_id 1527742598685099` (es un **App ID, no un Pixel ID**).

---

## 4. El embudo real (la clave de "por qué no hay reservas")

### A dónde va el anuncio
- El anuncio del Mundial (CTA *Book Travel*) → **`book.legaluxlimo.com/20off`** = el **formulario de captura** (nombre/email/teléfono para el código 20%). ✅ Confirmado por el usuario (yo lo había deducido mal al inicio; corregido).
- El formulario hace POST a un **webhook de n8n** (`/webhook/20off-lead`) y promete enviar el código por email.

### Dos caminos distintos en el sitio
1. **Anuncio → `/20off`** (lead form) → n8n → (email del código vía **SendGrid**, según el usuario).
2. **`index.html`** (cotización en la raíz) → botón **"Reserve Now"** → `booking.html` → pago (Stripe/Clover). *Este camino NO es por donde entra el tráfico del anuncio.*

---

## 5. Hallazgos en los datos (logs del repo + Gmail)

### Logs de reservas (repo)
- `counters.json` → **`conf: 0`** (cero reservas confirmadas), `inv: 33` facturas.
- `invoice-log.txt` → casi todas **$0.00** y con **correos de prueba del propio dueño** (`jrosales0601@gmail.com`, etc.). Última actividad: **19-may** (antes de la campaña).
- Aviso recurrente de bug: **`customer not resolved … checkout will proceed without customer link`**.
- Mezcla de **dos procesadores**: Stripe y Clover.

### Gmail
- Los únicos correos "Your 20% Discount Code" salieron a **`jrosales0601@gmail.com`**, marcados **"(TEST)"** → solo pruebas del dueño, **0 leads reales** visibles.
- Reservas confirmadas (abril) = **todas pruebas** del dueño.
- ⚠️ Se observaron **rebotes** (`mailer-daemon`: *"Send mail as is misconfigured"*) en correos enviados vía **Gmail "send as" `info@legaluxlimo.com`** (reportes diarios de Ads y emails de prueba).

> **Corrección importante:** el usuario aclaró que los correos del cliente salen por **SendGrid (vía n8n)**, no por Gmail. Por tanto **NO se puede afirmar que la entrega al cliente esté rota** — eso se verifica en el **Activity Feed de SendGrid** (no accesible desde esta sesión).

---

## 6. Diagnóstico: por qué $31 de ads → 334 visitas → 0 reservas

Cadena de fallos acumulados:
1. **Campaña optimizada a "clics/visitas", no a Leads** → trae curiosos, no compradores.
2. **No hay pixel** → no se mide cuántos de los 334 llenan el formulario, y Meta no puede buscar gente que convierta.
3. **No hay confirmación de que los leads reales lleguen ni de que el email del código se entregue** (pendiente verificar en n8n + SendGrid).
4. **Sin medición = sin remarketing y sin seguimiento optimizado.**

---

## 7. Hallazgos de seguridad (URGENTE, aparte)
`book/meta-webhook.php` tiene **credenciales en texto plano commiteadas al repo**:
- **Anthropic API key** (`sk-ant-…`), **Facebook Page Access Token**, **Instagram Access Token**, verify token.
- **Acción:** rotarlas YA (regenerar) y moverlas a variables de entorno.

---

## 8. Limitaciones de acceso de esta sesión (importante)
- **n8n:** NO hay MCP de n8n conectado en esta sesión (verificado). El Claude de tu PC y este Claude en la nube son entornos aislados; las credenciales no se comparten.
- **Sitio en vivo:** la red del entorno **bloquea el egress** a dominios no autorizados (`host_not_allowed`) → no puedo abrir `book.legaluxlimo.com` ni n8n/SendGrid directamente.
- **Repo `legaluxlimo`:** se accede vía el servidor GitHub MCP secundario (lectura/escritura disponible).
- **MCP conectados:** Meta Ads (Pipeboard), GitHub, Motion, Canva, Google Calendar, Google Drive, Gmail, Firecrawl.

---

## 9. Plan recomendado (orden por impacto)

1. **🔥 Verificar y arreglar la entrega de leads/correos**
   - Revisar **executions del webhook `20off-lead` en n8n** → ¿llegan leads reales?
   - Revisar **SendGrid Activity** → ¿los códigos 20% se entregan/abren?
2. **Instalar el pixel `532463836280153`** (`PageView` en las 3 páginas + `Lead` en `/20off`; `Purchase`/`InitiateCheckout` en `booking.html` como fase 2). → da visibilidad del embudo.
3. **Cambiar el objetivo de la campaña** de "Landing Page Views" a **Leads** (una vez el pixel tenga datos).
4. **Remarketing** a quienes visitaron y no convirtieron.
5. **Seguimiento/cierre** de cada lead capturado.
6. **Rotar las credenciales expuestas** de `meta-webhook.php`.

---

## 10. Pendientes / decisiones del usuario
- [ ] Confirmar qué Pixel ID consolidar (recomendado: `532463836280153`).
- [ ] Autorizar instalación del pixel en el repo (rama, sin deploy automático).
- [ ] Definir método de **deploy a GoDaddy** (no accesible desde esta sesión).
- [ ] (Opcional) Conectar un **MCP de n8n** al entorno + allowlist del host, o enviar screenshots de n8n/SendGrid.
- [ ] Rotar credenciales expuestas.

---

*Nota: los logs del repo podrían estar levemente desfasados respecto al servidor en vivo (el repo va desincronizado con producción, como se vio con el pixel).*
