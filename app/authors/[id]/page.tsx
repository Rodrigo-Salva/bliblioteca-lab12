"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Book = { id: string; title: string; genre?: string; publishedYear?: number; pages?: number };
type Author = { id: string; name: string; email?: string; nationality?: string; birthYear?: number; bio?: string; books: Book[] };
type Stats = {
  totalBooks: number;
  firstBook?: { title: string; year: number };
  latestBook?: { title: string; year: number };
  averagePages?: number;
  genres?: string[];
  longestBook?: { title: string; pages: number };
};

const inputCls = "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition";
const labelCls = "block text-xs font-medium text-slate-500 mb-1";

const GENRES = ["Ficción", "No ficción", "Ciencia ficción", "Fantasía", "Misterio", "Romance", "Historia", "Biografía", "Terror", "Poesía"];

export default function AuthorPage() {
  const { id } = useParams<{ id: string }>();
  const [author, setAuthor] = useState<Author | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [bookForm, setBookForm] = useState({ title: "", genre: "", publishedYear: "", pages: "" });
  const [editForm, setEditForm] = useState({ name: "", bio: "" });
  const [editOpen, setEditOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);

  const reload = () => {
    fetch(`/api/authors/${id}`).then(r => r.json()).then(d => { setAuthor(d); setEditForm({ name: d.name, bio: d.bio || "" }); });
    fetch(`/api/authors/${id}/stats`).then(r => r.json()).then(setStats);
  };

  useEffect(() => { reload(); }, [id]);

  const addBook = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...bookForm,
        publishedYear: bookForm.publishedYear ? parseInt(bookForm.publishedYear) : undefined,
        pages: bookForm.pages ? parseInt(bookForm.pages) : undefined,
        authorId: id,
      }),
    });
    setBookForm({ title: "", genre: "", publishedYear: "", pages: "" });
    setBookOpen(false);
    reload();
  };

  const updateAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/authors/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) });
    setEditOpen(false);
    reload();
  };

  if (!author) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
        Cargando autor...
      </div>
    );
  }

  const initials = author.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div>
      {/* Back */}
      <a href="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-6">
        ← Volver a autores
      </a>

      {/* Author header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 flex items-start gap-5">
        <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xl shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-slate-900">{author.name}</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {[author.nationality, author.email, author.birthYear ? `Nacido en ${author.birthYear}` : null].filter(Boolean).join(" · ")}
          </p>
          {author.bio && <p className="text-sm text-slate-600 mt-2 leading-relaxed">{author.bio}</p>}
        </div>
        <button
          onClick={() => setEditOpen(true)}
          className="text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors shrink-0"
        >
          Editar
        </button>
      </div>

      {/* Stats */}
      {stats && stats.totalBooks > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">{stats.totalBooks}</p>
            <p className="text-xs text-slate-500 mt-1">Libros</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{stats.averagePages ?? "—"}</p>
            <p className="text-xs text-slate-500 mt-1">Pág. promedio</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-sm font-semibold text-slate-700 truncate">{stats.firstBook?.title ?? "—"}</p>
            <p className="text-xs text-slate-400 mt-1">Primer libro{stats.firstBook?.year ? ` (${stats.firstBook.year})` : ""}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-sm font-semibold text-slate-700 truncate">{stats.latestBook?.title ?? "—"}</p>
            <p className="text-xs text-slate-400 mt-1">Último libro{stats.latestBook?.year ? ` (${stats.latestBook.year})` : ""}</p>
          </div>
        </div>
      )}

      {stats?.genres && stats.genres.length > 0 && (
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className="text-xs text-slate-400">Géneros:</span>
          {stats.genres.map(g => (
            <span key={g} className="text-xs bg-indigo-50 text-indigo-600 font-medium px-2.5 py-1 rounded-full">{g}</span>
          ))}
        </div>
      )}

      {/* Books section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Libros ({author.books.length})</h2>
        <button
          onClick={() => setBookOpen(true)}
          className="text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          + Agregar libro
        </button>
      </div>

      {author.books.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-200 p-8 text-center">
          <p className="text-slate-400 text-sm">Este autor no tiene libros todavía.</p>
          <button onClick={() => setBookOpen(true)} className="mt-2 text-indigo-600 text-sm font-medium hover:underline">
            Agregar el primero
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {author.books.map(book => (
            <div key={book.id} className="bg-white rounded-xl border border-slate-200 p-4 flex gap-3 hover:border-indigo-200 transition-colors">
              <div className="w-8 h-11 rounded bg-indigo-100 flex items-center justify-center shrink-0 text-indigo-400 text-sm">
                📖
              </div>
              <div className="min-w-0">
                <p className="font-medium text-slate-900 truncate">{book.title}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {book.genre && <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{book.genre}</span>}
                  {book.publishedYear && <span className="text-xs text-slate-400">{book.publishedYear}</span>}
                  {book.pages && <span className="text-xs text-slate-400">{book.pages} pág.</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal editar autor */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-5">Editar autor</h2>
            <form onSubmit={updateAuthor} className="space-y-4">
              <div>
                <label className={labelCls}>Nombre</label>
                <input className={inputCls} value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Biografía</label>
                <textarea className={inputCls} rows={3} value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors">
                  Guardar cambios
                </button>
                <button type="button" onClick={() => setEditOpen(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 rounded-lg transition-colors">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal agregar libro */}
      {bookOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-5">Agregar libro</h2>
            <form onSubmit={addBook} className="space-y-4">
              <div>
                <label className={labelCls}>Título *</label>
                <input className={inputCls} placeholder="Título del libro" value={bookForm.title} onChange={e => setBookForm({ ...bookForm, title: e.target.value })} required />
              </div>
              <div>
                <label className={labelCls}>Género</label>
                <select className={inputCls} value={bookForm.genre} onChange={e => setBookForm({ ...bookForm, genre: e.target.value })}>
                  <option value="">Sin género</option>
                  {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Año</label>
                  <input className={inputCls} type="number" placeholder="2024" value={bookForm.publishedYear} onChange={e => setBookForm({ ...bookForm, publishedYear: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Páginas</label>
                  <input className={inputCls} type="number" placeholder="320" value={bookForm.pages} onChange={e => setBookForm({ ...bookForm, pages: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors">
                  Agregar
                </button>
                <button type="button" onClick={() => setBookOpen(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 rounded-lg transition-colors">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
