import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const genre = searchParams.get("genre") || "";
    const authorName = searchParams.get("authorName") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const sortBy = (searchParams.get("sortBy") as "title" | "publishedYear" | "createdAt") || "createdAt";
    const order = (searchParams.get("order") as "asc" | "desc") || "desc";

    const where = {
      AND: [
        search ? { title: { contains: search, mode: "insensitive" as const } } : {},
        genre ? { genre: { equals: genre } } : {},
        authorName ? { author: { name: { contains: authorName, mode: "insensitive" as const } } } : {},
      ],
    };

    const total = await prisma.book.count({ where });
    const totalPages = Math.ceil(total / limit);

    const data = await prisma.book.findMany({
      where,
      include: { author: true },
      orderBy: { [sortBy]: order },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch {
    return NextResponse.json({ error: "Error en la búsqueda" }, { status: 500 });
  }
}