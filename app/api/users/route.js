import { NextResponse } from 'next/server';

import { createUser, listUsers } from '@/lib/dataRepository.mjs';

export async function GET() {
  try {
    return NextResponse.json(await listUsers());
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    return NextResponse.json(await createUser(await request.json()));
  } catch (err) {
    const status = err.code === '23505' ? 409 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
