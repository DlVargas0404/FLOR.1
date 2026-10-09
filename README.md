# STOP BURGER ERIK · Sitio web + panel administrativo

Aplicación web completa para el restaurante **STOP BURGER ERIK** (Av. 12 #10a-67, Barrio San Jose, Cúcuta).

- **Sitio público**: menú digital dinámico, carrito, pedido por WhatsApp, horarios con "Abierto ahora", ubicación, galería, redes y SEO.
- **Panel `/admin`**: gestión de productos, categorías, fotos, horarios, ubicaciones, información del negocio, redes y configuración.
- **Sin cuentas de clientes** ni pagos en línea. El único usuario con login es el administrador.

## Tecnologías

| Pieza | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Estilos | Tailwind CSS 3 (mobile first) |
| Base de datos / Auth / Storage | Supabase (PostgreSQL + RLS, Supabase Auth, Supabase Storage) |
| Iconos | lucide-react (+ SVG propios para marcas) |
| Validación | zod |
| Despliegue | Vercel + Supabase |

## Estructura

```
app/
  (public)/            Sitio público (layout con navbar, footer, carrito, WhatsApp)
  admin/login/         Inicio de sesión del administrador
  admin/(panel)/       Panel: dashboard, menu, productos, categorias, fotos,
                       ubicaciones, horarios, negocio, redes, configuracion
  admin/actions.ts     Server action que refresca el sitio público tras guardar
  sitemap.ts · robots.ts · opengraph-image.tsx · icon.svg
components/            ui/ layout/ home/ menu/ cart/ admin/
lib/                   clientes supabase, whatsapp, hours, format, validation, image, errors
services/              site.ts (lectura pública), admin.ts (CRUD del panel), storage.ts (imágenes)
hooks/  types/
middleware.ts          Protege /admin/*
supabase/              schema.sql · seed.sql · create_admin.sql
```

## Cómo funciona

- **Menú**: se lee de Supabase (`categories`, `products`); nada está escrito en el código. Si el dueño cambia un precio en `/admin/menu`, el sitio público se actualiza al instante (la server action invalida la caché; como respaldo la página se revalida cada 60 s).
- **Carrito**: `localStorage`, sin registro. Al cargar, los precios y la disponibilidad se re-sincronizan con la base de datos (si un producto se agotó se quita del carrito y se avisa).
- **Pedido**: el cliente llena nombre, teléfono, tipo de pedido (recoger o domicilio con dirección, barrio y referencia) y método de pago. Se abre `https://wa.me/573176363783?text=…` con el pedido ya redactado. **No se guarda ningún dato personal** y no se usa ninguna API de WhatsApp.
- **Horarios**: se guardan como franjas por día (admite cerrado, varias franjas y cierre después de medianoche, p. ej. 4:00 PM – 1:30 AM). "ABIERTO AHORA / CERRADO" se calcula en el navegador con la hora de Colombia (`America/Bogota`).
- **Imágenes**: antes de subirlas se redimensionan (máx. 1600 px) y se convierten a WEBP en el navegador. Se sirven con `next/image`. Formatos aceptados: JPG, JPEG, PNG, WEBP (máx. 5 MB en el bucket).
- **Mapa**: mapa incrustado de Google Maps por dirección, sin API key. **No hay coordenadas inventadas**: el administrador puede agregar latitud/longitud o una URL de Google Maps en `/admin/ubicaciones`.

## 1. Ejecutar localmente

Requisitos: Node.js 20 o superior (probado con 22).

```bash
npm install
cp .env.example .env.local     # y completa las variables (ver paso 2)
npm run dev                    # http://localhost:3000
```

Otros comandos: `npm run build`, `npm run start`, `npm run lint`, `npm run typecheck`.

> Sin variables de Supabase el sitio abre igualmente, pero el menú aparece vacío con un aviso, y el login del admin avisa que Supabase no está configurado.

## 2. Configurar Supabase

1. Crea un proyecto en <https://supabase.com> (el plan gratuito sirve).
2. **SQL Editor → New query**: pega y ejecuta **`supabase/schema.sql`** (tablas, índices, restricciones, RLS, bucket de imágenes y políticas de storage). Se puede volver a ejecutar sin problema.
3. En otra consulta ejecuta **`supabase/seed.sql`** (información del negocio, horarios, categorías y los productos del menú físico).
4. **Project Settings → API**: copia `Project URL` y la clave **`anon` / publishable** en `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

   ⚠️ **Nunca** uses ni publiques la `service_role` key. Esta app no la necesita.
5. **Authentication → Sign In / Providers**: deja el login con email y contraseña y **desactiva "Allow new users to sign up"** para que nadie pueda registrarse. Aunque alguien lograra crear un usuario no podría modificar nada: solo quienes estén en `admin_users` pasan las políticas RLS.

## 3. Crear el primer administrador

No existe registro público. El administrador se crea a mano:

1. **Authentication → Users → Add user → Create new user**: escribe su correo y una contraseña segura, y marca **Auto Confirm User**.
2. **SQL Editor**: abre `supabase/create_admin.sql`, cambia `CAMBIA-ESTE-CORREO@ejemplo.com` por ese mismo correo y ejecútalo. Debe devolver 1 fila.
3. Entra a **`/admin/login`** con ese correo y contraseña. Después de iniciar sesión llegas a **`/admin`**. El botón **"Cerrar sesión"** está arriba a la derecha.

Para agregar más administradores repite los pasos 1 y 2. Para quitar acceso: `delete from public.admin_users where email = '...';`. La contraseña se cambia en **Admin → Configuración**.

## 4. Datos del menú pendientes de verificar

El seed se hizo a partir de la foto del menú. Lo que no se leía con total claridad **no se inventó**: quedó marcado con `needs_review = true` y una nota **"VERIFICAR CON EL CLIENTE"** que solo ve el administrador (el sitio público muestra una descripción neutra). En `/admin/productos` el botón **"Por revisar"** los filtra; al corregir un producto se apaga su marca "Pendiente de revisión". Los más importantes:

- **Picada familiar**: en la foto parece decir `$56.000` (podría ser `$55.000`).
- **Full Burrito** y **Shawarma**: aparecen en la columna de perros; confirmar categoría y descripción (Shawarma no trae descripción).
- **Parrilla Stop**: confirmar el ingrediente "rapiyuca".
- **La Campeona**: la descripción termina en "aguacate.." (puede faltar texto).
- **Salchipapas, Picadas, Patacón, Choripollos, Clubhouse, Maduro mixto, El Clásico**: el menú no detalla ingredientes.
- **Desgranados Stop y Mister Santy**: texto muy pequeño en la foto.
- Los **productos destacados** iniciales (La Colombiana, La Bichota, La Exótica, La Reina, Costillas BBQ, Parrilla Stop) son una sugerencia: cámbialos en el panel.
- La nota de domicilio ("El valor del domicilio se confirma por WhatsApp"), el eslogan y la descripción larga son textos propuestos: edítalos en **Información del negocio** y **Configuración**.
- La **URL de Facebook** no se conoce (el menú solo la menciona): agrégala en **Redes sociales**. Las redes vacías no se muestran.
- Los productos **todavía no tienen fotos**: se muestra el emoji de la categoría hasta que subas una desde el panel. Tampoco hay foto principal: mientras tanto el inicio usa una ilustración.

## 5. Desplegar en Vercel

1. Sube el repositorio a GitHub. En <https://vercel.com> → **Add New → Project** importa el repo (se detecta Next.js).
2. En **Environment Variables** agrega:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` = tu dominio final sin `/` (p. ej. `https://stopburgererik.com`). Se usa en SEO, sitemap y Open Graph.
3. **Deploy**. Luego, en Supabase → **Authentication → URL Configuration**, pon tu dominio en *Site URL*.
4. Si cambias alguna `NEXT_PUBLIC_*`, vuelve a desplegar (se incorporan en el build).

## Seguridad

- Solo se usan `NEXT_PUBLIC_SUPABASE_URL` y la clave `anon`; no hay secretos en el código y `.env.local` está en `.gitignore`.
- **RLS en todas las tablas**: el público solo **lee** lo público (categorías, ubicaciones, fotos y redes activas; productos de categorías activas; info y horarios). Toda escritura exige `is_admin()` (el usuario debe existir en `admin_users`). `admin_users` solo puede leerse a sí misma y no tiene políticas de escritura desde la API.
- Storage: bucket público `media` (JPG/PNG/WEBP, 5 MB). Solo los administradores pueden subir, cambiar o borrar.
- `/admin/*` está protegido por `middleware.ts` (sesión + pertenencia a `admin_users`) y de nuevo en el layout del panel. La web pública no depende de cookies, por eso puede cachearse.
- El panel es `noindex` y `robots.txt` lo excluye.

## Preparado para crecer

La estructura permite agregar después, sin rehacer lo existente: pedidos internos y estados (`orders`, `order_items` con precio histórico), extras y tamaños (`product_options`), combos, promociones y cupones, métodos de pago, estadísticas y múltiples sucursales (`locations` y `business_hours.location_id` ya existen). Los tamaños actuales (personal / mediana / grande) son productos independientes; más adelante pueden migrarse a opciones de un solo producto.

## Notas

- El mapa incrustado y las fuentes (Google Fonts) requieren internet.
- `index.html` y `style.css` en la raíz son archivos anteriores del repositorio (una página de prueba) y no forman parte de la aplicación Next.js.
