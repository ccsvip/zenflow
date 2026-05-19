import { NextResponse } from 'next/server';

import {
  createRequirement,
  listRequirements,
} from '@/lib/dataRepository.mjs';

export async function GET() {
  try {
    return NextResponse.json(await listRequirements());
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    return NextResponse.json(await createRequirement(await request.json()));
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
