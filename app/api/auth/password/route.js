import { NextResponse } from 'next/server';

import { changePassword } from '@/lib/dataRepository.mjs';

export async function POST(request) {
  try {
    const { userId, oldPassword, newPassword } = await request.json();
    const user = await changePassword(userId, oldPassword, newPassword);

    if (!user) {
      return NextResponse.json({ error: '\u539f\u5bc6\u7801\u9519\u8bef' }, { status: 400 });
    }

    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
