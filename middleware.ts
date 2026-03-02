import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                },
            },
        }
    )

    // بنجيب بيانات المستخدم المسجل
    const { data: { user } } = await supabase.auth.getUser()

    // لو المستخدم مش مسجل ورايح لصفحة محتاجة حماية (زي stats أو dashboard)
    if (!user && (request.nextUrl.pathname.startsWith('/stats') || request.nextUrl.pathname.startsWith('/dashboard'))) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return response
}

export const config = {
    matcher: [
        /*
         * الماتشر ده بيحمي كل حاجة 
         * ماعدا (صفحة اللوجين، صفحة الساين أب، الصور، والملفات الداخلية)
         */
        '/((?!login|signup|api|_next/static|_next/image|favicon.ico).*)',
    ],
}