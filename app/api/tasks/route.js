import { NextResponse } from 'next/server';

import { createTask, listTasks } from '@/lib/dataRepository.mjs';

export async function GET() {
  try {
    return NextResponse.json(await listTasks());
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    return NextResponse.json(await createTask(await request.json()));
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
