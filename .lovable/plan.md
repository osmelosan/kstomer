## Objetivo
Completar la página **Ajustes** y **pulir el header/navegación** para que todas las secciones e iconos visibles del producto respondan a la interacción del usuario.

## Parte 1 — Completar Ajustes

Activar las 3 secciones del menú que hoy no hacen nada (`Billing`, `Security`, `Integrations`) y hacer funcional el botón **Save**.

### `src/routes/settings.tsx`
- Ampliar `activeSection` a los 6 valores (`profile | notifications | language | billing | security | integrations`) y eliminar el filtro que ignora los clicks.
- Renderizar condicionalmente las tarjetas según `activeSection` (en lugar del scroll actual con todo apilado). Cada sección muestra solo su bloque.
- **Billing** (mock, sin pasarela): tarjeta con plan actual (badge "Pro"), próximo cargo, método de pago enmascarado (`•••• 4242`), historial de facturas (3 filas mock con fecha/importe/botón "Descargar"), botón "Cambiar de plan".
- **Security**: campos *Cambiar contraseña* (actual / nueva / confirmar), toggle 2FA, lista de sesiones activas (2 filas mock con dispositivo + "Cerrar sesión"), botón destructivo "Eliminar cuenta".
- **Integrations**: grid de tarjetas (Google Calendar, Gmail, Slack, Zapier, Webhooks) con estado "Conectado / Conectar" y botón.
- **Save**: estado local `saving` → simula guardado 600 ms → toast de éxito vía `sonner` (`toast.success(t("settings.saved"))`). El botón se desactiva durante la operación.

### `src/lib/i18n/{fr,en,es}.ts`
- Añadir claves: `settings.saved`, y todos los strings nuevos de Billing/Security/Integrations (plan, nextCharge, paymentMethod, invoices, changePlan, currentPassword, newPassword, confirmPassword, twoFactor, twoFactorHint, activeSessions, signOutSession, deleteAccount, deleteAccountHint, connected, connect, integrations.googleCalendar, integrations.gmail, integrations.slack, integrations.zapier, integrations.webhooks, etc.).

## Parte 2 — Pulir header y navegación

### Campana de notificaciones (`AppShell.tsx`)
- Reemplazar el `<button>` por un `Popover` (shadcn) que abra un panel de 360px de ancho con:
  - Cabecera "Notificaciones" + acción "Marcar todo como leído".
  - Lista mock de 4-5 notificaciones (icono según tipo, título, descripción, timestamp relativo, punto azul si no leída).
  - Footer con link "Ver todas".
- Badge rojo con contador de no leídas sobre el icono.

### Icono de ayuda (`AppShell.tsx`)
- Reemplazar por `DropdownMenu` con: "Documentación", "Atajos de teclado" (abre un `Dialog` con tabla de shortcuts mock), "Contactar soporte", "Novedades".

### Búsqueda global del header
- Cuando la prop `search` **no** se pasa, mostrar siempre un input de búsqueda global (placeholder `t("appshell.globalSearch")`) que al focusear abra un `CommandDialog` (shadcn `Command`) con:
  - Atajo `⌘K` / `Ctrl+K` para abrir.
  - Grupos: "Páginas" (links a Dashboard/Kanban/Contactos/Revendedores/Analítica/Archivos/Ajustes), "Contactos recientes" (mock), "Acciones" ("Nuevo contacto", "Nuevo revendedor").
  - Navegación con `useNavigate`.

### Filtrado por empresa (`CompanySwitcher`)
- Subir el estado del switcher a un contexto ligero (`CompanyContext` nuevo en `src/lib/company-context.tsx`) accesible por todas las páginas.
- En `dashboard.tsx`, `kanban.tsx`, `contacts.index.tsx`, `resellers.tsx`, `analytics.tsx`, `archives.tsx`: leer `currentCompany` del contexto y filtrar los datos mock por un campo `companyId` (añadirlo a los datos mock). Cuando `id === "all"` no se filtra.
- Mostrar un pequeño indicador bajo el título de cada página (ej. "Mostrando datos de **Acme Studio**") cuando hay una empresa concreta seleccionada.

### Logout
- Como aún no hay auth real, mantener `navigate("/")` pero añadir un `toast.info(t("common.loggedOut"))` antes para que el feedback sea explícito.

## Notas técnicas
- Solo cambios de UI/presentación + un contexto cliente. **Nada de backend** (Lovable Cloud queda fuera de este plan; ya lo marcaste como otra prioridad para más adelante).
- Reutilizar componentes shadcn existentes (`Popover`, `DropdownMenu`, `Dialog`, `Command`, `Badge`, `sonner`); instalar con `bunx shadcn@latest add ...` solo los que falten.
- Mantener i18n en los 3 idiomas (FR/EN/ES) para cada string nuevo.
- No tocar `resellers.tsx` / `analytics.tsx` salvo para enganchar el filtro de empresa.

## Fuera de alcance (siguientes pasos)
- Activar Lovable Cloud, auth real, persistencia (lo marcaste como prioridad separada).
- Pasarela de pagos real en Billing.
- Notificaciones reales (push, email).
