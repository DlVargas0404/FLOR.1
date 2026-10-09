import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase/env';

/**
 * Protege /admin/*: exige sesión de Supabase y que el usuario esté en admin_users.
 * (Las políticas RLS siguen siendo la barrera real; esto evita mostrar el panel.)
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === '/admin/login';

  if (!isSupabaseConfigured()) {
    if (isLogin) return NextResponse.next();
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data } = await supabase.from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle();
    isAdmin = Boolean(data);
  }

  if (isLogin) {
    if (user && isAdmin) return NextResponse.redirect(new URL('/admin', request.url));
    return response;
  }

  if (!user || !isAdmin) {
    const url = new URL('/admin/login', request.url);
    if (user && !isAdmin) url.searchParams.set('error', 'forbidden');
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
