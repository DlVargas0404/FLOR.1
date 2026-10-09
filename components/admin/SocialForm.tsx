'use client';

import { useEffect, useState } from 'react';
import { Card, ErrorBox, FormField, LoadingList, PageHeader, SubmitButton, Toggle } from '@/components/admin/ui';
import { useToast } from '@/components/ui/ToastProvider';
import { useAdminData } from '@/hooks/useAdminData';
import { usePublish } from '@/hooks/usePublish';
import { SOCIAL_PLATFORMS } from '@/lib/constants';
import { explainError } from '@/lib/errors';
import { socialUrlSchema } from '@/lib/validation';
import { socialApi } from '@/services/admin';
import type { SocialPlatform } from '@/types/database';

interface Row {
  url: string;
  is_active: boolean;
}

export function SocialForm() {
  const toast = useToast();
  const publish = usePublish();
  const { data, loading, error, reload } = useAdminData(() => socialApi.list());
  const [rows, setRows] = useState<Record<SocialPlatform, Row>>(() => emptyRows());
  const [errors, setErrors] = useState<Partial<Record<SocialPlatform, string>>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!data) return;
    const next = emptyRows();
    for (const r of data) next[r.platform] = { url: r.url ?? '', is_active: r.is_active };
    setRows(next);
  }, [data]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Partial<Record<SocialPlatform, string>> = {};
    const payload = SOCIAL_PLATFORMS.map(({ key }) => {
      const raw = rows[key].url.trim();
      // WhatsApp acepta URL vacía (usa el número del negocio)
      const parsed = socialUrlSchema.safeParse(raw);
      if (!parsed.success) errs[key] = parsed.error.issues[0]?.message ?? 'URL inválida';
      return { platform: key, url: parsed.success ? parsed.data : null, is_active: rows[key].is_active };
    });
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error('Revisa las URLs marcadas');
      return;
    }
    setBusy(true);
    try {
      await socialApi.save(payload);
      toast.success('Redes sociales actualizadas correctamente');
      await publish();
      await reload(true);
    } catch (err) {
      toast.error(explainError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Redes sociales" description="Las redes que dejes vacías no se muestran en la web." />
      {loading ? (
        <LoadingList rows={5} />
      ) : error ? (
        <ErrorBox message={error} onRetry={() => reload()} />
      ) : (
        <form onSubmit={submit} noValidate>
          <Card className="space-y-5">
            {SOCIAL_PLATFORMS.map(({ key, label, placeholder }) => (
              <div key={key} className="flex flex-wrap items-end gap-3">
                <FormField label={label} htmlFor={`soc-${key}`} error={errors[key]} className="min-w-0 flex-1 basis-64">
                  <input
                    id={`soc-${key}`}
                    type="url"
                    inputMode="url"
                    className="input"
                    placeholder={placeholder}
                    value={rows[key].url}
                    onChange={(e) => {
                      setRows((r) => ({ ...r, [key]: { ...r[key], url: e.target.value } }));
                      setErrors((x) => ({ ...x, [key]: '' }));
                    }}
                  />
                </FormField>
                <span className="flex items-center gap-2 pb-2 text-xs font-semibold text-black/60">
                  <Toggle checked={rows[key].is_active} onChange={(v) => setRows((r) => ({ ...r, [key]: { ...r[key], is_active: v } }))} label={`${label} visible`} />
                  Visible
                </span>
              </div>
            ))}
            <div className="flex justify-end">
              <SubmitButton busy={busy}>Guardar cambios</SubmitButton>
            </div>
          </Card>
        </form>
      )}
    </>
  );
}

function emptyRows(): Record<SocialPlatform, Row> {
  return Object.fromEntries(SOCIAL_PLATFORMS.map((p) => [p.key, { url: '', is_active: true }])) as Record<SocialPlatform, Row>;
}
