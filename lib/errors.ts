/** Traduce errores de Supabase/Postgres/red a mensajes claros para el administrador. */
export function explainError(error: unknown): string {
  if (!error) return 'Ocurrió un error desconocido.';
  const e = error as { code?: string; message?: string; details?: string; status?: number; statusCode?: string };
  const msg = (e.message ?? String(error)).toLowerCase();

  if (msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('load failed')) {
    return 'No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.';
  }
  if (msg.includes('jwt expired') || e.status === 401) return 'Tu sesión expiró. Vuelve a iniciar sesión.';
  if (e.code === '42501' || msg.includes('row-level security') || msg.includes('permission denied') || e.status === 403) {
    return 'No tienes permisos para esta acción. Verifica que tu usuario esté registrado como administrador.';
  }
  switch (e.code) {
    case '23505':
      return 'Ya existe un registro con ese nombre o identificador.';
    case '23503':
      return 'No se puede completar: hay información relacionada (por ejemplo, una categoría con productos).';
    case '23514':
      return 'Alguno de los valores no es válido (por ejemplo, un precio negativo).';
    case '23502':
      return 'Falta un dato obligatorio.';
    case '42P01':
      return 'Falta una tabla en la base de datos. Ejecuta supabase/schema.sql.';
    case 'PGRST116':
      return 'No se encontró el registro.';
  }
  if (msg.includes('payload too large') || msg.includes('exceeded the maximum')) return 'El archivo es demasiado grande.';
  if (msg.includes('mime type') || msg.includes('not supported')) return 'Formato de archivo no permitido. Usa JPG, PNG o WEBP.';
  if (msg.includes('bucket not found')) return 'No existe el bucket "media". Ejecuta supabase/schema.sql.';
  return e.message || 'Ocurrió un error inesperado.';
}
