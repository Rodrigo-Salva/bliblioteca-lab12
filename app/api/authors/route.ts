import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const authors = await prisma.author.findMany({
      include: { books: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(authors);
  } catch {
    return NextResponse.json({ error: "Error al obtener autores" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, nationality, birthYear, bio } = body;

    if (!name) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }

    const author = await prisma.author.create({
      data: { name, email, nationality, birthYear, bio },
    });
    return NextResponse.json(author, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al crear autor" }, { status: 500 });
  }
}