-- =====================================================================
-- STOP BURGER ERIK · Datos iniciales
-- Ejecutar DESPUÉS de schema.sql. Se puede volver a ejecutar sin duplicar
-- (los productos existentes no se sobrescriben).
--
-- Fuente: foto del menú físico. Los datos poco legibles quedan con
-- needs_review = true y una nota que SOLO ve el administrador
-- ("VERIFICAR CON EL CLIENTE"). El dueño los corrige desde /admin/productos.
-- Las imágenes de los productos se suben después desde el panel.
-- =====================================================================

-- ---------- Información del negocio ----------
insert into public.business_info
  (id, name, tagline, short_description, long_description, phone, whatsapp,
   address, neighborhood, city, department, country, rating, rating_source, show_rating)
values
  (1, 'STOP BURGER ERIK',
   'El sabor que siempre quieres repetir',
   'Hamburguesas, perros, parrillas y comidas rápidas en Cúcuta.',
   'En STOP BURGER ERIK preparamos hamburguesas, perros calientes, salchipapas, picadas, parrillas, choripollos y mucho más, con ingredientes frescos y el sabor que le gusta a Cúcuta. Pide en el local o a domicilio.',
   '317 636 3783', '573176363783',
   'Av. 12 #10a-67', 'San Jose', 'Cúcuta', 'Norte de Santander', 'Colombia',
   4.8, 'Google', true)
on conflict (id) do nothing;

insert into public.site_settings (id, accept_orders, closed_message, order_greeting, order_closing, delivery_note)
values (1, true,
  'Por ahora no estamos recibiendo pedidos por la web. Escríbenos por WhatsApp.',
  'Hola, STOP BURGER ERIK 👋',
  'Gracias.',
  'El valor del domicilio se confirma por WhatsApp.') -- VERIFICAR CON EL CLIENTE
on conflict (id) do nothing;

-- ---------- Ubicación (sin coordenadas: se configuran desde /admin/ubicaciones) ----------
insert into public.locations (name, address, neighborhood, city, department, phone, sort_order)
select 'STOP BURGER ERIK', 'Av. 12 #10a-67', 'San Jose', 'Cúcuta', 'Norte de Santander', '317 636 3783', 0
where not exists (select 1 from public.locations);

-- ---------- Horario general: todos los días 4:00 PM - 1:30 AM ----------
insert into public.business_hours (location_id, day_of_week, is_closed, slots)
select null, d, false, '[{"open":"16:00","close":"01:30"}]'::jsonb
from generate_series(0, 6) as d
on conflict (coalesce(location_id, '00000000-0000-0000-0000-000000000000'::uuid), day_of_week) do nothing;

-- ---------- Redes sociales (vacías: no se muestran hasta configurarlas) ----------
insert into public.social_links (platform, url, is_active) values
  ('facebook', null, true),     -- VERIFICAR CON EL CLIENTE: el menú menciona Facebook, falta la URL
  ('instagram', null, true),
  ('tiktok', null, true),
  ('whatsapp', null, true),     -- vacío = se usa el número de business_info
  ('google_maps', null, true)   -- vacío = se usa la URL de la ubicación
on conflict (platform) do nothing;

-- ---------- Categorías ----------
insert into public.categories (name, slug, emoji, description, sort_order) values
  ('Entradas',          'entradas',        '🧀', null, 1),
  ('Hamburguesas',      'hamburguesas',    '🍔', 'Todas incluyen vegetales, salsas y papa ripio.', 2),
  ('Perros',            'perros',          '🌭', 'Todos incluyen papa ripio y salsas.', 3),
  ('Parrillas',         'parrillas',       '🍖', 'Todas incluyen vegetales, papa a la francesa y salsas.', 4),
  ('Patacón',           'patacon',         '🍌', null, 5),
  ('Salchipapas',       'salchipapas',     '🍟', null, 6),
  ('Sandwich',          'sandwich',        '🥪', null, 7),
  ('Picadas',           'picadas',         '🍽️', null, 8),
  ('Choripollos',       'choripollos',     '🍗', null, 9),
  ('Desgranados Stop',  'desgranados-stop','🌽', 'Elige mixto o solo pollo.', 10),
  ('Mister Santy',      'mister-santy',    '🔥', null, 11)
on conflict (slug) do nothing;

-- ---------- Productos ----------
-- Columnas: categoría, nombre, descripción, precio COP, orden, destacado, revisar, nota
insert into public.products (category_id, name, description, price, sort_order, is_featured, needs_review, review_note)
select c.id, v.name, v.description, v.price, v.sort_order, v.is_featured, v.needs_review, v.review_note
from (values
  -- ENTRADAS
  ('entradas', 'Chorizos cocteleros + papa a la francesa', 'Chorizos cocteleros acompañados de papa a la francesa.', 10000, 1, false, false, null),
  ('entradas', 'Maduro relleno de queso', 'Maduro relleno de queso.', 8000, 2, false, false, null),
  ('entradas', 'Maduro relleno mixto', 'Maduro relleno mixto.', 12000, 3, false, true, 'VERIFICAR CON EL CLIENTE: ingredientes del relleno mixto.'),
  ('entradas', 'Servicio de papas a la francesa', 'Porción de papas a la francesa.', 6000, 4, false, false, null),

  -- HAMBURGUESAS (incluyen vegetales, salsas y papa ripio)
  ('hamburguesas', 'La Original', 'Carne, jamón y queso.', 4000, 1, false, false, null),
  ('hamburguesas', 'La Soltera', 'Carne, huevo, jamón y queso.', 5000, 2, false, false, null),
  ('hamburguesas', 'La Santa', 'Carne, tocineta, jamón y queso.', 6000, 3, false, false, null),
  ('hamburguesas', 'La Famosa', 'Carne, maduro, chorizo, jamón y queso.', 7000, 4, false, false, null),
  ('hamburguesas', 'Pollo Burger', 'Filete de pechuga o pollo desmechado, huevo, jamón y queso.', 8000, 5, false, false, null),
  ('hamburguesas', 'La Madurita', 'Carne desmechada, maduro, tocineta, jamón y queso.', 9000, 6, false, false, null),
  ('hamburguesas', 'La Potra', 'Doble carne, huevo, tocineta, jamón y queso.', 10000, 7, false, false, null),
  ('hamburguesas', 'La Patrona', 'Pollo desmechado, carne, huevo, tocineta, jamón y queso.', 12000, 8, false, false, null),
  ('hamburguesas', 'La Costeña', 'Carne desmechada, pollo desmechado, maduro, queso asado, tocineta y chorizo.', 14000, 9, false, false, null),
  ('hamburguesas', 'La Colombiana', 'Carne, cerdo desmechado, pollo apanado, aguacate, tocineta, jamón y queso.', 16000, 10, true, false, null),
  ('hamburguesas', 'La Campeona', 'Doble carne, chuleta, pollo desmechado, tocineta, jamón, queso y aguacate.', 18000, 11, false, true, 'VERIFICAR CON EL CLIENTE: la descripción del menú termina en "aguacate.." y puede faltar texto.'),
  ('hamburguesas', 'La Bichota', 'Carne, tocineta, maduro, filete de pechuga, carne desmechada, maíz y queso derretido. Con papa criolla.', 20000, 12, true, false, null),
  ('hamburguesas', 'La Exótica', 'Triple carne, filete de pechuga, chuleta y tocineta, bañada en queso derretido. Con papa criolla.', 24000, 13, true, false, null),
  ('hamburguesas', 'La Reina Stop Burger', 'Doble carne, tocineta, chorizo, filete de pechuga, huevo, cerdo desmechado y aguacate, bañada en queso derretido y coronada con alita BBQ. Con papa criolla.', 27000, 14, true, false, null),

  -- PERROS (incluyen papa ripio y salsas)
  ('perros', 'El Clásico', 'Perro caliente clásico.', 4000, 1, false, true, 'VERIFICAR CON EL CLIENTE: el menú solo trae el precio, sin descripción.'),
  ('perros', 'El Bacon', 'Salchicha americana y huevo de codorniz.', 6000, 2, false, true, 'VERIFICAR CON EL CLIENTE: confirmar si lleva tocineta.'),
  ('perros', 'El Jefe', 'Tres salchichas, tocineta, jamón y queso.', 8000, 3, false, false, null),
  ('perros', 'El Socio', 'Salchicha americana, carne desmechada, queso derretido y tocineta.', 10000, 4, false, false, null),
  ('perros', 'El Parcero', 'Salchicha americana, carne desmechada, pollo desmechado, queso derretido, tocineta y maíz.', 12000, 5, false, false, null),
  ('perros', 'La Bestia', 'Salchicha americana, pollo picado, chorizo, queso derretido y huevo de codorniz.', 13000, 6, false, false, null),
  ('perros', 'Full Burrito', 'Vegetales, carne picada, pollo picado, tocineta, aguacate, chorizo y queso rallado. Con papa criolla.', 15000, 7, false, true, 'VERIFICAR CON EL CLIENTE: en el menú aparece en la columna de perros; confirmar categoría y descripción.'),
  ('perros', 'Shawarma', 'Shawarma de la casa.', 15000, 8, false, true, 'VERIFICAR CON EL CLIENTE: el menú solo trae el precio, sin descripción. Confirmar categoría.'),
  ('perros', 'La Perra', 'Salchicha americana, cerdo desmechado, carne desmechada, pollo desmechado, queso derretido y aguacate. Con papa criolla.', 16000, 9, false, false, null),

  -- PARRILLAS (incluyen vegetales, papa a la francesa y salsas)
  ('parrillas', 'Pechuga en salsa BBQ', 'Pechuga a la parrilla en salsa BBQ.', 16000, 1, false, false, null),
  ('parrillas', 'Lomo en salsa BBQ', 'Lomo a la parrilla en salsa BBQ.', 16000, 2, false, false, null),
  ('parrillas', 'Costillas en salsa BBQ', 'Costillas en salsa BBQ.', 18000, 3, true, false, null),
  ('parrillas', 'Alitas x6 en salsa BBQ', 'Seis alitas en salsa BBQ.', 22000, 4, false, false, null),
  ('parrillas', 'Pincho mixto', 'Pincho mixto a la parrilla.', 15000, 5, false, false, null),

  -- PATACÓN
  ('patacon', 'Patacón solo pollo', 'Patacón con pollo.', 17000, 1, false, true, 'VERIFICAR CON EL CLIENTE: el menú no detalla los ingredientes del patacón.'),
  ('patacon', 'Patacón mixto', 'Patacón mixto.', 19000, 2, false, true, 'VERIFICAR CON EL CLIENTE: el menú no detalla los ingredientes del patacón.'),

  -- SALCHIPAPAS
  ('salchipapas', 'Salchipapa personal', 'Porción personal.', 10000, 1, false, true, 'VERIFICAR CON EL CLIENTE: el menú no detalla los ingredientes.'),
  ('salchipapas', 'Salchipapa mediana', 'Para 2 personas.', 17000, 2, false, true, 'VERIFICAR CON EL CLIENTE: el menú no detalla los ingredientes.'),
  ('salchipapas', 'Salchipapa grande', 'Para 3 personas.', 25000, 3, false, true, 'VERIFICAR CON EL CLIENTE: el menú no detalla los ingredientes.'),

  -- SANDWICH
  ('sandwich', 'Sándwich de pollo', 'Vegetales, pollo desmechado, huevo, jamón, queso y salsas.', 8000, 1, false, false, null),
  ('sandwich', 'Clubhouse de pollo', 'Tres panes, vegetales, huevo, jamón, queso y salsas.', 16000, 2, false, true, 'VERIFICAR CON EL CLIENTE: confirmar ingredientes de cada Clubhouse (pollo / mixto).'),
  ('sandwich', 'Clubhouse mixto', 'Tres panes, vegetales, huevo, jamón, queso y salsas.', 18000, 3, false, true, 'VERIFICAR CON EL CLIENTE: confirmar ingredientes de cada Clubhouse (pollo / mixto).'),
  ('sandwich', 'Nuggets + papa a la francesa', 'Nuggets con papa a la francesa.', 10000, 4, false, false, null),

  -- PICADAS
  ('picadas', 'Picada personal', 'Porción personal.', 18000, 1, false, true, 'VERIFICAR CON EL CLIENTE: el menú no detalla los ingredientes de la picada.'),
  ('picadas', 'Picada mediana', 'Para 2 personas.', 30000, 2, false, true, 'VERIFICAR CON EL CLIENTE: el menú no detalla los ingredientes de la picada.'),
  ('picadas', 'Picada grande', 'Para 3 a 4 personas.', 45000, 3, false, true, 'VERIFICAR CON EL CLIENTE: el menú no detalla los ingredientes de la picada.'),
  ('picadas', 'Picada familiar', 'Para 5 personas.', 56000, 4, false, true, 'VERIFICAR CON EL CLIENTE: el precio se lee $56.000 en la foto; confirmar si es $55.000.'),
  ('picadas', 'Parrilla Stop', 'Papa a la francesa, costillas BBQ, carne, pollo, salchicha americana, rapiyuca, chorizo, trozos de maduro, queso y huevos de codorniz.', 40000, 5, true, true, 'VERIFICAR CON EL CLIENTE: confirmar el ingrediente "rapiyuca" y la lista completa.'),

  -- CHORIPOLLOS
  ('choripollos', 'Choripollo personal', 'Porción personal.', 14000, 1, false, true, 'VERIFICAR CON EL CLIENTE: el menú no detalla los ingredientes.'),
  ('choripollos', 'Choripollo mediano', 'Para 2 personas.', 24000, 2, false, true, 'VERIFICAR CON EL CLIENTE: el menú no detalla los ingredientes.'),
  ('choripollos', 'Choripollo grande', 'Para 3 personas.', 35000, 3, false, true, 'VERIFICAR CON EL CLIENTE: el menú no detalla los ingredientes.'),

  -- DESGRANADOS STOP (elige mixto o solo pollo)
  ('desgranados-stop', 'Desgranado Stop personal', 'Pollo desmechado, salchicha americana, papa ripio, papa a la francesa, queso derretido, tocineta, huevo de codorniz y salsas. Elige mixto o solo pollo.', 20000, 1, false, true, 'VERIFICAR CON EL CLIENTE: confirmar ingredientes (texto pequeño en el menú).'),
  ('desgranados-stop', 'Desgranado Stop grande', 'Pollo desmechado, salchicha americana, papa ripio, papa a la francesa, queso derretido, tocineta, huevo de codorniz y salsas. Elige mixto o solo pollo.', 35000, 2, false, true, 'VERIFICAR CON EL CLIENTE: confirmar ingredientes (texto pequeño en el menú).'),

  -- MISTER SANTY
  ('mister-santy', 'Mister Santy personal', 'Carne desmechada, pollo desmechado, salchicha americana, chorizo, trozos de maduro, papa a la francesa, queso rallado, huevo de codorniz, vegetales y salsas.', 18000, 1, false, true, 'VERIFICAR CON EL CLIENTE: confirmar ingredientes (texto pequeño en el menú).'),
  ('mister-santy', 'Mister Santy grande', 'Carne desmechada, pollo desmechado, salchicha americana, chorizo, trozos de maduro, papa a la francesa, queso rallado, huevo de codorniz, vegetales y salsas.', 32000, 2, false, true, 'VERIFICAR CON EL CLIENTE: confirmar ingredientes (texto pequeño en el menú).')
) as v(cat_slug, name, description, price, sort_order, is_featured, needs_review, review_note)
join public.categories c on c.slug = v.cat_slug
on conflict (category_id, name) do nothing;
