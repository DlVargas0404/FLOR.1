'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, ErrorBox, FormField, LoadingList, PageHeader, SubmitButton, ToggleRow } from '@/components/admin/ui';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { useToast } from '@/components/ui/ToastProvider';
import { useAdminData } from '@/hooks/useAdminData';
import { usePublish } from '@/hooks/usePublish';
import { explainError } from '@/lib/errors';
import { businessSchema, fieldErrors } from '@/lib/validation';
import { businessApi } from '@/services/admin';
import { removeImage } from '@/services/storage';

type TextKey =
  | 'name' | 'tagline' | 'short_description' | 'long_description' | 'phone' | 'whatsapp'
  | 'address' | 'neighborhood' | 'city' | 'department' | 'country' | 'rating' | 'rating_source';

const EMPTY: Record<TextKey, string> = {
  name: '', tagline: '', short_description: '', long_description: '', phone: '', whatsapp: '',
  address: '', neighborhood: '', city: '', department: '', country: '', rating: '', rating_source: '',
};

export function BusinessForm() {
  const toast = useToast();
  const publish = usePublish();
  const { data, loading, error, reload } = useAdminData(() => businessApi.get());
  const [v, setV] = useState(EMPTY);
  const [showRating, setShowRating] = useState(true);
  const [logo, setLogo] = useState<{ url: string | null; path: string | null }>({ url: null, path: null });
  const [hero, setHero] = useState<{ url: string | null; path: string | null }>({ url: null, path: null });
  const uploaded = useRef<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading || error) return;
    const b = data;
    setV({
      name: b?.name ?? 'STOP BURGER ERIK',
      tagline: b?.tagline ?? '',
      short_description: b?.short_description ?? '',
      long_description: b?.long_description ?? '',
      phone: b?.phone ?? '',
      whatsapp: b?.whatsapp ?? '',
      address: b?.address ?? '',
      neighborhood: b?.neighborhood ?? '',
      city: b?.city ?? '',
      department: b?.department ?? '',
      country: b?.country ?? 'Colombia',
      rating: b?.rating != null ? String(b.rating) : '',
      rating_source: b?.rating_source ?? 'Google',
    });
    setShowRating(b?.show_rating ?? true);
    setLogo({ url: b?.logo_url ?? null, path: b?.logo_path ?? null });
    setHero({ url: b?.hero_image_url ?? null, path: b?.hero_image_path ?? null });
  }, [data, loading, error]);

  const set = (k: TextKey, val: string) => {
    setV((s) => ({ ...s, [k]: val }));
    setErrors((e) => ({ ...e, [k]: '' }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = businessSchema.safeParse({ ...v, show_rating: showRating });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      toast.error('Revisa los campos marcados');
      return;
    }
    setBusy(true);
    try {
      await businessApi.save({
        ...parsed.data,
        logo_url: logo.url,
        logo_path: logo.path,
        hero_image_url: hero.url,
        hero_image_path: hero.path,
      });
      const keep = new Set([logo.path, hero.path]);
      const stale = [data?.logo_path, data?.hero_image_path, ...uploaded.current].filter((p): p is string => !!p && !keep.has(p));
      await Promise.all([...new Set(stale)].map((p) => removeImage(p)));
      uploaded.current = [];
      toast.success('Información actualizada correctamente');
      await publish();
      await reload(true);
    } catch (err) {
      toast.error(explainError(err));
    } finally {
      setBusy(false);
    }
  };

  const field = (k: TextKey, label: string, o?: { hint?: string; type?: string; textarea?: boolean; className?: string }) => (
    <FormField label={label} htmlFor={`biz-${k}`} error={errors[k]} hint={o?.hint} className={o?.className}>
      {o?.textarea ? (
        <textarea id={`biz-${k}`} rows={4} className="input resize-y" value={v[k]} onChange={(e) => set(k, e.target.value)} />
      ) : (
        <input id={`biz-${k}`} type={o?.type ?? 'text'} className="input" value={v[k]} onChange={(e) => set(k, e.target.value)} />
      )}
    </FormField>
  );

  return (
    <>
      <PageHeader title="Información del negocio" description="Datos generales que se muestran en la web, el pie de página y Google." />
      {loading ? (
        <LoadingList rows={5} />
      ) : error ? (
        <ErrorBox message={error} onRetry={() => reload()} />
      ) : (
        <form onSubmit={submit} noValidate className="space-y-4">
          <Card className="space-y-4">
            <h2 className="font-display text-2xl uppercase tracking-wide">General</h2>
            {field('name', 'Nombre')}
            {field('tagline', 'Eslogan', { hint: 'Frase corta bajo el título principal.' })}
            {field('short_description', 'Descripción corta', { hint: 'Se usa en el pie de página y en Google.' })}
            {field('long_description', 'Descripción larga', { textarea: true, hint: 'Se muestra en la sección “Conoce STOP BURGER ERIK”.' })}
          </Card>

          <Card className="space-y-4">
            <h2 className="font-display text-2xl uppercase tracking-wide">Contacto y dirección</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {field('phone', 'Teléfono (como se muestra)', { type: 'tel', hint: 'Ej: 317 636 3783' })}
              {field('whatsapp', 'WhatsApp (formato internacional)', { hint: 'Solo números con indicativo, sin +. Ej: 573176363783. Aquí llegan los pedidos.' })}
            </div>
            {field('address', 'Dirección')}
            <div className="grid gap-4 sm:grid-cols-2">
              {field('neighborhood', 'Barrio')}
              {field('city', 'Ciudad')}
              {field('department', 'Departamento')}
              {field('country', 'País')}
            </div>
            <p className="text-xs text-black/50">La ubicación detallada (mapa, coordenadas) se administra en la sección Ubicaciones.</p>
          </Card>

          <Card className="space-y-4">
            <h2 className="font-display text-2xl uppercase tracking-wide">Imágenes</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <ImageUploader
                label="Logo (opcional)"
                url={logo.url}
                folder="branding"
                maxDimension={600}
                aspectClass="aspect-square max-w-[200px]"
                onUploaded={(i) => {
                  uploaded.current.push(i.path);
                  setLogo(i);
                }}
                onRemove={() => setLogo({ url: null, path: null })}
                hint="Cuadrado, idealmente con fondo transparente (PNG/WEBP)."
              />
              <ImageUploader
                label="Imagen principal (portada)"
                url={hero.url}
                folder="branding"
                maxDimension={1400}
                aspectClass="aspect-square max-w-[320px]"
                onUploaded={(i) => {
                  uploaded.current.push(i.path);
                  setHero(i);
                }}
                onRemove={() => setHero({ url: null, path: null })}
                hint="Foto de una hamburguesa. Si no subes una se usa una ilustración."
              />
            </div>
          </Card>

          <Card className="space-y-4">
            <h2 className="font-display text-2xl uppercase tracking-wide">Calificación</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {field('rating', 'Calificación (0 a 5)', { type: 'number', hint: 'Ej: 4.8' })}
              {field('rating_source', 'Fuente', { hint: 'Ej: Google' })}
            </div>
            <ToggleRow id="biz-show-rating" label="Mostrar calificación en la web" checked={showRating} onChange={setShowRating} />
          </Card>

          <div className="sticky bottom-0 -mx-4 flex justify-end border-t border-black/10 bg-neutral-100/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
            <SubmitButton busy={busy}>Guardar cambios</SubmitButton>
          </div>
        </form>
      )}
    </>
  );
}
