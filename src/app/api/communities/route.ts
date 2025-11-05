import { NextResponse } from 'next/server';
import { COMMUNITIES } from '@/data/communities';

export async function GET() {
  return NextResponse.json({ communities: COMMUNITIES });
}
