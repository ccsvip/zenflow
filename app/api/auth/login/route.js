import { NextResponse } from 'next/server';

import { loginUser } from '@/lib/dataRepository.mjs';
import { createSession } from '@/lib/session.mjs';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    const user = await loginUser(username, password);

    if (!user) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 });
    }

    const session = createSession(user);
    return NextResponse.json(session);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
