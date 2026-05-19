import { NextResponse } from 'next/server';

import { listAllData } from '@/lib/dataRepository.mjs';

export async function GET() {
  try {
    return NextResponse.json(await listAllData());
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
