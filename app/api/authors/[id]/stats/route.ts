import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const author = await prisma.author.findUnique({ where: { id } });
    if (!author) return NextResponse.json({ error: "Autor no encontrado" }, { status: 404 });

    const books = await prisma.book.findMany({ where: { authorId: id } });
    if (books.length === 0) {
      return NextResponse.json({ authorId: id, authorName: author.name, totalBooks: 0 });
    }

    const sorted = [...books].sort((a, b) => (a.publishedYear ?? 0) - (b.publishedYear ?? 0));
    const withPages = books.filter((b) => b.pages);
    const avgPages = withPages.length > 0
      ? Math.round(withPages.reduce((s, b) => s + (b.pages ?? 0), 0) / withPages.length)
      : null;
    const genres = [...new Set(books.map((b) => b.genre).filter(Boolean))];
    const longest = books.reduce((a, b) => (b.pages ?? 0) > (a.pages ?? 0) ? b : a);
    const shortest = books.reduce((a, b) => (b.pages ?? Infinity) < (a.pages ?? Infinity) ? b : a);

    return NextResponse.json({
      authorId: id,
      authorName: author.name,
      totalBooks: books.length,
      firstBook: { title: sorted[0].title, year: sorted[0].publishedYear },
      latestBook: { title: sorted[sorted.length - 1].title, year: sorted[sorted.length - 1].publishedYear },
      averagePages: avgPages,
      genres,
      longestBook: { title: longest.title, pages: longest.pages },
      shortestBook: { title: shortest.title, pages: shortest.pages },
    });
  } catch {
    return NextResponse.json({ error: "Error al obtener estadísticas" }, { status: 500 });
  }
}