"use client";
import { useEffect, useState, useCallback } from "react";

type Author = { id: string; name: string };
type Book = { id: string; title: string; description?: string; isbn?: string; genre?: string; publishedYear?: number; pages?: number; author: Author; authorId: string };

const inputCls = "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition";
const labelCls = "block text-xs font-medium text-slate-500 mb-1";

const GENRES = ["Ficción", "No ficción", "Ciencia ficción", "Fantasía", "Misterio", "Romance", "Historia", "Biografía", "Terror", "Poesía"];

const emptyForm = { title: "", description: "", isbn: "", publishedYear: "", genre: "", pages: "", authorId: "" };

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, hasNext: false, hasPrev: false });
  const [loading, setLoading] = useState(false);

  // modal crear
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // modal editar
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);

  const fetchAuthors = async () => {
    const res = await fetch("/api/authors");
    setAuthors(await res.json());
  };

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ search, genre, authorName, sortBy, order, page: page.toString(), limit: "10" });
    const res = await fetch(`/api/books/search?${params}`);
    const json = await res.json();
    setBooks(json.data ?? []);
    setPagination(json.pagination);
    setLoading(false);
  }, [search, genre, authorName, sortBy, order, page]);

  useEffect(() => { fetchAuthors(); }, []);
  useEffect(() => { const t = setTimeout(fetchBooks, 300); return () => clearTimeout(t); }, [fetchBooks]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, publishedYear: form.publishedYear ? parseInt(form.publishedYear) : undefined, pages: form.pages ? parseInt(form.pages) : undefined }),
    });
    setForm(emptyForm);
    setCreateOpen(false);
    fetchBooks();
  };

  const openEdit = (book: Book) => {
    setEditId(book.id);
    setEditForm({
      title: book.title,
      description: book.description ?? "",
      isbn: book.isbn ?? "",
      publishedYear: book.publishedYear?.toString() ?? "",
      genre: book.genre ?? "",
      pages: book.pages?.toString() ?? "",
      authorId: book.authorId,
    });
    setEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/books/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editForm, publishedYear: editForm.publishedYear ? parseInt(editForm.publishedYear) : undefined, pages: editForm.pages ? parseInt(editForm.pages) : undefined }),
    });
    setEditOpen(false);
    setEditId(null);
    fetchBooks();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este libro?")) return;
    await fetch(`/api/books/${id}`, { method: "DELETE" });
    fetchBooks();
  };

  const BookFormFields = ({ values, onChange }: { values: typeof emptyForm; onChange: (v: typeof emptyForm) => void }) => (
    <div className="space-y-4">
      <div>
        <label className={labelCls}>Título *</label>
        <input className={inputCls} placeholder="Ej. Cien años de soledad" value={values.title} onChange={e => onChange({ ...values, title: e.target.value })} required />
      </div>
      <div>
        <label className={labelCls}>Descripción</label>
        <textarea className={inputCls} rows={2} placeholder="Sinopsis del libro..." value={values.description} onChange={e => onChange({ ...values, description: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Año de publicación</label>
          <input className={inputCls} type="number" placeholder="1967" value={values.publishedYear} onChange={e => onChange({ ...values, publishedYear: e.target.value })} />
        </div>
        <div>
          <label className={labelCls}>Páginas</label>
          <input className={inputCls} type="number" placeholder="432" value={values.pages} onChange={e => onChange({ ...values, pages: e.target.value })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Género</label>
          <select className={inputCls} value={values.genre} onChange={e => onChange({ ...values, genre: e.target.value })}>
            <option value="">Sin género</option>
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>ISBN</label>
          <input className={inputCls} placeholder="978-..." value={values.isbn} onChange={e => onChange({ ...values, isbn: e.target.value })} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Autor *</label>
        <select className={inputCls} value={values.authorId} onChange={e => onChange({ ...values, authorId: e.target.value })} required>
          <option value="">Seleccionar autor</option>
          {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Libros</h1>
          <p className="text-sm text-slate-500 mt-0.5">{pagination.total} libros en la biblioteca</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nuevo libro
        </button>
      </div>

      {/* Modal crear libro */}
      {createOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-5">Nuevo libro</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <BookFormFields values={form} onChange={setForm} />
              <div className="flex gap-2 pt-1">
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors">Crear libro</button>
                <button type="button" onClick={() => setCreateOpen(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 rounded-lg transition-colors">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal editar libro */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-5">Editar libro</h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <BookFormFields values={editForm} onChange={setEditForm} />
              <div className="flex gap-2 pt-1">
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors">Guardar cambios</button>
                <button type="button" onClick={() => setEditOpen(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 rounded-lg transition-colors">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className={labelCls}>Buscar título</label>
            <input className={inputCls} placeholder="Buscar..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <div>
            <label className={labelCls}>Género</label>
            <select className={inputCls} value={genre} onChange={e => { setGenre(e.target.value); setPage(1); }}>
              <option value="">Todos los géneros</option>
              {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Autor</label>
            <input className={inputCls} placeholder="Nombre del autor..." value={authorName} onChange={e => { setAuthorName(e.target.value); setPage(1); }} />
          </div>
          <div>
            <label className={labelCls}>Ordenar por</label>
            <select className={inputCls} value={`${sortBy}-${order}`} onChange={e => { const [s, o] = e.target.value.split("-"); setSortBy(s); setOrder(o); }}>
              <option value="createdAt-desc">Más recientes</option>
              <option value="title-asc">Título A-Z</option>
              <option value="title-desc">Título Z-A</option>
              <option value="publishedYear-desc">Año (desc)</option>
              <option value="publishedYear-asc">Año (asc)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de libros */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 text-sm">Buscando libros...</div>
      ) : books.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-slate-400 text-sm">No se encontraron libros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {books.map(book => (
            <div key={book.id} className="bg-white rounded-xl border border-slate-200 p-4 flex gap-4 hover:border-indigo-200 transition-colors">
              <div className="w-10 h-14 rounded-md bg-indigo-100 flex items-center justify-center shrink-0">
                <span className="text-indigo-400 text-xl">📖</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">{book.title}</p>
                <p className="text-xs text-indigo-600 font-medium mt-0.5">{book.author?.name}</p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {book.genre && <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{book.genre}</span>}
                  {book.publishedYear && <span className="text-xs text-slate-400">{book.publishedYear}</span>}
                  {book.pages && <span className="text-xs text-slate-400">{book.pages} pág.</span>}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  onClick={() => openEdit(book)}
                  className="text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(book.id)}
                  className="text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            disabled={!pagination.hasPrev}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 text-sm bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Anterior
          </button>
          <span className="text-sm text-slate-500">Página {page} de {pagination.totalPages}</span>
          <button
            disabled={!pagination.hasNext}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 text-sm bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}
