import { NextRequest, NextResponse } from "next/server";
import { db, projects } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const projectList = await db.select().from(projects);
    return NextResponse.json(projectList);
  } catch (error) {
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
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save project" },
      { status: 500 }
    );
  }
}

export async function GET_PROJECT(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Project ID required" },
        { status: 400 }
      );
    }
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}
