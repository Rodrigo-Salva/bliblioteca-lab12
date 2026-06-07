"use client";
import { useEffect, useState } from "react";

type Book = { id: string; title: string; genre?: string; publishedYear?: number };
type Author = { id: string; name: string; email?: string; nationality?: string; books: Book[] };

const inputCls = "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition";
const labelCls = "block text-xs font-medium text-slate-500 mb-1";

function AuthorAvatar({ name }: { name: string }) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const colors = ["bg-indigo-100 text-indigo-700", "bg-violet-100 text-violet-700", "bg-sky-100 text-sky-700", "bg-emerald-100 text-emerald-700", "bg-amber-100 text-amber-700"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${color}`}>
      {initials}
    </div>
  );
}

export default function Dashboard() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [form, setForm] = useState({ name: "", email: "", nationality: "", birthYear: "", bio: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const fetchAuthors = async () => {
    setLoading(true);
    const res = await fetch("/api/authors");
    setAuthors(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchAuthors(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, birthYear: form.birthYear ? parseInt(form.birthYear) : undefined };
    if (editId) {
      await fetch(`/api/authors/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      setEditId(null);
    } else {
      await fetch("/api/authors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }
    setForm({ name: "", email: "", nationality: "", birthYear: "", bio: "" });
    setOpen(false);
    fetchAuthors();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este autor y todos sus libros?")) return;
    await fetch(`/api/authors/${id}`, { method: "DELETE" });
    fetchAuthors();
  };

  const handleEdit = (a: Author) => {
    setEditId(a.id);
    setForm({ name: a.name, email: a.email || "", nationality: a.nationality || "", birthYear: "", bio: "" });
    setOpen(true);
  };

  const cancelForm = () => { setEditId(null); setForm({ name: "", email: "", nationality: "", birthYear: "", bio: "" }); setOpen(false); };

  const totalBooks = authors.reduce((s, a) => s + a.books.length, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Autores</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gestiona los autores de tu biblioteca</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nuevo autor
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-3xl font-bold text-indigo-600">{authors.length}</p>
          <p className="text-sm text-slate-500 mt-1">Autores registrados</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-3xl font-bold text-emerald-600">{totalBooks}</p>
          <p className="text-sm text-slate-500 mt-1">Libros en total</p>
        </div>
      </div>

      {/* Form modal */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-20 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-5">{editId ? "Editar autor" : "Nuevo autor"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelCls}>Nombre *</label>
                <input className={inputCls} placeholder="Ej. Gabriel García Márquez" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Email</label>
                  <input className={inputCls} type="email" placeholder="autor@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Nacionalidad</label>
                  <input className={inputCls} placeholder="Colombiano" value={form.nationality} onChange={e => setForm({ ...form, nationality: e.target.value })} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Año de nacimiento</label>
                <input className={inputCls} type="number" placeholder="1927" value={form.birthYear} onChange={e => setForm({ ...form, birthYear: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Biografía</label>
                <textarea className={inputCls} rows={3} placeholder="Breve descripción del autor..." value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors">
                  {editId ? "Actualizar" : "Crear autor"}
                </button>
                <button type="button" onClick={cancelForm} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 rounded-lg transition-colors">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Authors list */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 text-sm">Cargando autores...</div>
      ) : authors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-slate-400 text-sm">No hay autores aún.</p>
          <button onClick={() => setOpen(true)} className="mt-3 text-indigo-600 text-sm font-medium hover:underline">Agregar el primero</button>
        </div>
      ) : (
        <div className="space-y-3">
          {authors.map(author => (
            <div key={author.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 hover:border-indigo-200 transition-colors group">
              <AuthorAvatar name={author.name} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">{author.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {[author.nationality, `${author.books.length} libro${author.books.length !== 1 ? "s" : ""}`].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a href={`/authors/${author.id}`} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
                  Ver perfil
                </a>
                <button onClick={() => handleEdit(author)} className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors">
                  Editar
                </button>
                <button onClick={() => handleDelete(author.id)} className="text-xs font-medium text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
