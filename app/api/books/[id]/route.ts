import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const book = await prisma.book.findUnique({ where: { id }, include: { author: true } });
    if (!book) return NextResponse.json({ error: "Libro no encontrado" }, { status: 404 });
    return NextResponse.json(book);
  } catch {
    return NextResponse.json({ error: "Error al obtener libro" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const book = await prisma.book.update({ where: { id }, data: body, include: { author: true } });
    return NextResponse.json(book);
  } catch {
    return NextResponse.json({ error: "Error al actualizar libro" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.book.delete({ where: { id } });
    return NextResponse.json({ message: "Libro eliminado" });
  } catch {
    return NextResponse.json({ error: "Error al eliminar libro" }, { status: 500 });
  }
}