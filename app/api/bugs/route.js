import { NextResponse } from 'next/server';

import { createBug, listBugs } from '@/lib/dataRepository.mjs';

export async function GET() {
  try {
    return NextResponse.json(await listBugs());
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    return NextResponse.json(await createBug(await request.json()));
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
