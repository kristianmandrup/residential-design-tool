import { NextRequest, NextResponse } from "next/server";
import { db, projects } from "@/lib/db";

export async function GET() {
  try {
    const projectList = await db.select().from(projects);
    return NextResponse.json(projectList);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, data } = await req.json();
    const [newProject] = await db
      .insert(projects)
      .values({ name, data })
      .returning();
    return NextResponse.json(newProject);
  } catch {
    return NextResponse.json(
      { error: "Failed to save project" },
      { status: 500 }
    );
  }
}

