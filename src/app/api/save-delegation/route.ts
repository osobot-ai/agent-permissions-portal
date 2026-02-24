import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dir = path.join(os.homedir(), '.gator-cli', 'delegations');
    fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, 'default.json');
    fs.writeFileSync(filePath, JSON.stringify(body, null, 2));
    return NextResponse.json({ success: true, path: filePath });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
