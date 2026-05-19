import { NextResponse } from 'next/server';

import { deleteUser } from '@/lib/dataRepository.mjs';

export async function DELETE(_request, context) {
  try {
    const { id } = await context.params;
    await deleteUser(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
