import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Biblioteca | Next API Routes",
  description: "Sistema de gestión de autores y libros",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50 text-slate-900">
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <a href="/" className="font-bold text-indigo-600 text-lg tracking-tight">
              Biblioteca
            </a>
            <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
              <a href="/" className="hover:text-indigo-600 transition-colors">Autores</a>
              <a href="/books" className="hover:text-indigo-600 transition-colors">Libros</a>
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
