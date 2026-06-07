import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const author = await prisma.author.findUnique({
      where: { id },
      include: { books: true },
    });
    if (!author) return NextResponse.json({ error: "Autor no encontrado" }, { status: 404 });
    return NextResponse.json(author);
  } catch {
    return NextResponse.json({ error: "Error al obtener autor" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const author = await prisma.author.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(author);
  } catch {
    return NextResponse.json({ error: "Error al actualizar autor" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.author.delete({ where: { id } });
    return NextResponse.json({ message: "Autor eliminado" });
  } catch {
    return NextResponse.json({ error: "Error al eliminar autor" }, { status: 500 });
  }
}