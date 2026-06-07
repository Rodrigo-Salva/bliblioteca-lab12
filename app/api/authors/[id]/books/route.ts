import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const author = await prisma.author.findUnique({ where: { id } });
    if (!author) return NextResponse.json({ error: "Autor no encontrado" }, { status: 404 });

    const books = await prisma.book.findMany({
      where: { authorId: id },
      orderBy: { publishedYear: "asc" },
    });
    return NextResponse.json(books);
  } catch {
    return NextResponse.json({ error: "Error al obtener libros" }, { status: 500 });
  }
}