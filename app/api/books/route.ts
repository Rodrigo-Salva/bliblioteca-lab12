import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get("genre");

    const books = await prisma.book.findMany({
      where: genre ? { genre } : {},
      include: { author: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(books);
  } catch {
    return NextResponse.json({ error: "Error al obtener libros" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, isbn, publishedYear, genre, pages, authorId } = body;

    if (!title || !authorId) {
      return NextResponse.json({ error: "Título y authorId son requeridos" }, { status: 400 });
    }

    const book = await prisma.book.create({
      data: { title, description, isbn, publishedYear, genre, pages, authorId },
      include: { author: true },
    });
    return NextResponse.json(book, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al crear libro" }, { status: 500 });
  }
}