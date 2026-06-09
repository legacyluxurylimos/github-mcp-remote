# 🔧 Reporte — Pixel de Meta (cuenta act_1605540013677688)

## 1️⃣ Pixel ID — qué encontré

A nivel de **Business Manager** "Legacy Luxury Limo Corp" (`1038396061354237`) existe **un** pixel:

| Campo | Valor |
|---|---|
| **Pixel ID** | **`532463836280153`** |
| Nombre | Legacy Luxury Limo Corp - Pixel |
| Estado | Activo (en Meta) |
| Creado | 1-dic-2024 |
| Último evento navegador | **2025-09-04 (~9 meses atrás)** |
| Último evento servidor (CAPI) | **Nunca** |
| Eventos últimos 7 días | **0 (cero)** |

➡️ **Este pixel (`532...`) está muerto: no recibe eventos.** A nivel de la *ad account* directamente no hay ningún pixel/dataset asignado (`datasets: []`).

## 🔍 Pero hay un dato que lo cambia todo (corrección al reporte anterior)

Revisé el ad set activo **"NJ All — Mundial 2026"** y resulta que:

- **Ya está optimizando a `LANDING_PAGE_VIEWS`** (¡no a tráfico ciego!).
- Lleva **339 Landing Page Views** registradas y 431 link clicks → **~79% de los clics llegan a la landing**, a **~$0.09 por LPV**. Excelente.

**Meta no puede contar Landing Page Views sin un pixel disparando `PageView` en la página de destino.** Conclusión: **sí hay un pixel funcionando en la landing — pero NO es el `532463836280153`** (ese está en cero). Es otro pixel (el configurado como `promoted_object` del ad set, probablemente propio del sitio/booking o compartido desde otro Business). **Las herramientas de Pipeboard no exponen el `promoted_object.pixel_id`**, así que no pude extraer el ID exacto de ese pixel activo por API.

## 2️⃣ Verificación en el código del sitio — ⛔ BLOQUEADO

No pude revisar dónde está/no está instalado el pixel porque me topé con dos muros:

- **Repo `legacyluxurylimos/legaluxlimo`:** está **fuera del scope** de esta sesión (solo tengo `github-mcp-remote`). El acceso directo por GitHub MCP fue **denegado**. Las herramientas del entorno para añadir repos (`list_repos`/`add_repo`) **no están disponibles en esta sesión**, así que no pude auto-agregarlo.
- **Sitio en vivo** (`book.legaluxlimo.com` y `/20off`): la **política de red del entorno bloquea el egress** (`x-deny-reason: host_not_allowed`) y el proxy de fetch recibe **403**. No pude leer el HTML para confirmar qué Pixel ID está embebido.

## 3️⃣ Instalación + deploy a GoDaddy — ⛔ NO REALIZADO

No instalé nada ni hice deploy. Además de los bloqueos anteriores, **no tengo credenciales ni acceso a GoDaddy**, y un deploy a producción del sitio es una acción que cambia el sitio en vivo y requiere tu confirmación explícita. Cero cambios hechos.

## 4️⃣ ¿La campaña puede optimizar a conversiones reales? — ✅ YA LO HACE

- **Landing Page Views: SÍ, ya está activo y funcionando** (339 LPV, $0.09 c/u). No hace falta cambiar nada para LPV.
- **Lead: NO configurado.** Para optimizar a "Lead" necesitarías (a) un evento `Lead` disparándose (pixel con evento Lead, o un Lead Form nativo de Meta) y (b) recrear/editar el ad set con `optimization_goal = LEAD_GENERATION` y el `promoted_object` correspondiente. Hoy no existe ese evento.

---

## 📌 Resumen ejecutivo

- **Pixel ID (business):** `532463836280153` → **muerto** (0 eventos, sin CAPI).
- **Pixel realmente activo en la landing:** existe (la campaña mide 339 LPV), pero **no es el `532...`** y **no pude extraer su ID** por API ni leer el sitio/repo (scope + red bloqueada).
- **Dónde estaba/no estaba instalado:** **no verificable** desde esta sesión (repo fuera de scope, sitio no alcanzable).
- **Qué hice:** diagnóstico vía Pipeboard; **no instalé ni desplegué nada**.

## 🚦 Para desbloquear y terminar el trabajo, necesito una de estas:

1. **Añade `legacyluxurylimos/legaluxlimo` al scope de esta sesión** (desde la config del entorno de Claude Code web) — así leo el código y confirmo qué Pixel ID está embebido en `book.legaluxlimo.com` y `/20off`.
2. O dime **qué Pixel ID quieres como fuente única** (el `532...` u otro), y preparo el snippet exacto (`fbq('init', ...)` + `PageView` + evento de conversión) listo para pegar.
3. Para el deploy a **GoDaddy**: confírmame el método (¿GoDaddy Website Builder, cPanel/FTP, o el repo se despliega solo por push?) — yo no tengo acceso a GoDaddy.

**Recomendación aparte:** tienes un pixel zombi (`532...`) y otro pixel real en uso → eso es **fragmentación de señal**. Conviene consolidar a **un solo pixel** en todo el sitio + campañas, y **activar Conversions API (CAPI)** porque hoy los eventos de servidor están en cero (pierdes señal por iOS/adblockers).
