import { NextResponse } from 'next/server';

import { deleteBug, updateBug } from '@/lib/dataRepository.mjs';

export async function PUT(request, context) {
  try {
    const { id } = await context.params;
    return NextResponse.json(await updateBug(id, await request.json()));
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_request, context) {
  try {
    const { id } = await context.params;
    await deleteBug(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
