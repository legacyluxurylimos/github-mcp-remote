# 📌 Instalación del Meta Pixel — Guía de despliegue
### Legacy Luxury Limo · Pixel `532463836280153`
**Rama:** `claude/meta-pixel-install` (repo `legacyluxurylimos/legaluxlimo`) · **Sin deploy** (lo haces tú a GoDaddy)

---

## ✅ Estado de la rama
| Archivo | Estado | Qué hace |
|---|---|---|
| `book/20off.html` | ✅ Listo (commit `da1d757`) | Pixel inline: **PageView** + **Lead** (al enviarse el form). Form y webhook n8n **intactos**. |
| `book/meta-pixel.js` | ✅ Listo (commit `7adb866`) | Loader externo: **PageView** + **InitiateCheckout**. |
| `book/index.html` | ⏳ Falta 1 línea | Agregar `<script>` (abajo) → activa PageView. |
| `book/booking.html` | ⏳ Falta 1 línea | Agregar `<script>` (abajo) → activa PageView + InitiateCheckout. |

---

## 1) Contenido final de `book/meta-pixel.js`

```js
/*
 * Legacy Luxury Limo Corp — Meta Pixel loader (ADDITIVE / non-invasive)
 * Pixel ID: 532463836280153
 *
 * Include on a page with ONE line in <head>:
 *   <script src="/meta-pixel.js"></script>
 *
 * What it does (without touching any existing page logic):
 *   - Initializes the Meta Pixel and fires PageView on every page load.
 *   - Fires InitiateCheckout once when the user clicks the
 *     "Proceed to Payment" / "Proceder al Pago" button (booking page).
 *
 * The Lead event for the /20off form is handled inline in 20off.html;
 * do NOT include this file there to avoid a double init.
 */
(function () {
  if (window.__llcPixelLoaded) return;
  window.__llcPixelLoaded = true;

  // --- Meta Pixel base code ---
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '532463836280153');
  fbq('track', 'PageView');

  // --- InitiateCheckout: fires once when the user starts payment ---
  // Matches the booking page's "Proceed to Payment →" / "Proceder al Pago →"
  // button by its visible text. Harmless on pages where it does not exist.
  var icFired = false;
  document.addEventListener('click', function (e) {
    if (icFired) return;
    var el = e.target && e.target.closest ? e.target.closest('button,a,[role=button]') : null;
    if (!el) return;
    var txt = (el.textContent || '').toLowerCase();
    if (txt.indexOf('proceed to payment') > -1 || txt.indexOf('proceder al pago') > -1) {
      try { if (window.fbq) fbq('track', 'InitiateCheckout'); } catch (err) {}
      icFired = true;
    }
  }, true);
})();
```

---

## 2) La línea exacta a agregar

La **misma línea** en las dos páginas:

```html
<script src="/meta-pixel.js"></script>
```

---

## 3) Dónde va en cada archivo

| Archivo | Posición | Activa |
|---|---|---|
| **`book/index.html`** | **Antes de `</head>`** (al final del `<head>`, después de los `<style>`/`<script>` existentes) | PageView |
| **`book/booking.html`** | **Antes de `</head>`** (después de las líneas `<script src="...react/stripe...">` existentes) | PageView + InitiateCheckout |
| **`book/20off.html`** | **Nada que hacer** ✅ | Ya tiene el pixel inline (PageView + Lead) |

### Reglas clave
- Va **antes de `</head>`** (NO antes de `</body>`). El pixel debe cargar lo antes posible para no perder eventos.
- **NO** agregar la línea en `20off.html` → ya tiene el pixel inline; añadir el `.js` lo inicializaría dos veces.
- La ruta `/meta-pixel.js` (con `/`) funciona porque el archivo queda en `book.legaluxlimo.com/meta-pixel.js`. Si prefieres ruta relativa, usa `meta-pixel.js` (sin barra).

---

## 4) Ejemplo visual de la inserción

**`index.html`** (final del head):
```html
    ...estilos/scripts existentes...
    <script src="/meta-pixel.js"></script>   <!-- ← AGREGAR ESTA LÍNEA -->
  </head>
```

**`booking.html`** (final del head):
```html
    <script src="https://js.stripe.com/v3/"></script>
    <style> ... </style>
    <script src="/meta-pixel.js"></script>   <!-- ← AGREGAR ESTA LÍNEA -->
  </head>
```

---

## 5) Despliegue a GoDaddy (manual — lo haces tú)
1. Sube el archivo nuevo **`meta-pixel.js`** a la carpeta `book/` del sitio (queda en `book.legaluxlimo.com/meta-pixel.js`).
2. Sube `index.html` y `booking.html` con la línea `<script>` agregada antes de `</head>`.
3. `20off.html`: sube la versión de la rama (ya trae el pixel) — o no la toques si ya estaba.
4. **Verifica en Meta Events Manager** (pixel `532463836280153`): en pocos minutos deben llegar **PageView**, **Lead** (al enviar el form /20off) e **InitiateCheckout** (al iniciar pago en booking).

---

## 🔒 Recordatorios de seguridad (aparte del pixel)
1. **`book/meta-webhook.php`** — tiene credenciales en texto plano (Anthropic API key + tokens de Meta). **Rotarlas.**
2. **`book/booking.html`** — usa `pk_live_…` (publicable, OK), pero lee una Stripe key de `sessionStorage` (`stripe_key_temp`) y llama endpoints **secretos** de Stripe. Si esa key es secreta, está expuesta en el navegador. **Revisar.**

*No se hizo deploy. Todo está en la rama `claude/meta-pixel-install` para tu revisión.*
