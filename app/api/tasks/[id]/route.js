import { NextResponse } from 'next/server';

import { deleteTask, updateTask } from '@/lib/dataRepository.mjs';

export async function PUT(request, context) {
  try {
    const { id } = await context.params;
    return NextResponse.json(await updateTask(id, await request.json()));
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_request, context) {
  try {
    const { id } = await context.params;
    await deleteTask(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
