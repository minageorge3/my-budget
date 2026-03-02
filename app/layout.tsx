import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Toaster } from "sonner";
import Contact from "./components/contact";

export const metadata: Metadata = {
  title: 'Private Budget - لإدارة المصاريف الشخصية',
  description: 'أفضل تطبيق بسيط وآمن لإدارة مصاريفك الشخصية ومتابعة ميزانيتك اليومية.',
  keywords: 'ميزانية, مصاريف, محاسبة, مينا, budget, expenses, personal finance',
  // الحركة دي عشان لما تبعت اللينك على واتساب يظهر بشكل احترافي
  openGraph: {
    title: 'تطبيق ميزانية | Private Budget',
    description: 'تحكم في مصاريفك بسهولة مع تطبيق ميزانية ',
    type: 'website',
  },
}



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <nav className="bg-blue-600 text-white shadow-md">
          <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
            {/* اللوجو */}
            <div className="text-xl font-bold flex items-center gap-2">
              <span>💰</span>
              <span>My Budget</span>
            </div>

            {/* الروابط */}
            <div className="flex gap-4">
              <Link href="/dashboard" className="hover:bg-blue-800 px-3 py-2 rounded-md transition">
                Home
              </Link>
              <Link href="/charts" className="hover:bg-blue-800 px-3 py-2 rounded-md transition">
                Charts
              </Link>

            </div>
          </div>
        </nav>

        <main className="max-w-6xl mx-auto p-4">
          {children}
          <Toaster position="top-center" richColors />

          <Contact />
        </main>
      </body>
    </html>
  );
}
