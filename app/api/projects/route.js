import { NextResponse } from 'next/server';

import { createProject, listProjects } from '@/lib/dataRepository.mjs';

export async function GET() {
  try {
    return NextResponse.json(await listProjects());
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    return NextResponse.json(await createProject(await request.json()));
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
