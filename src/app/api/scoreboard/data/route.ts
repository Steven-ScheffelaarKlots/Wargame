import { NextResponse } from 'next/server';
import { mockScoreboardData } from '@/lib/api/mockData';

export async function GET() {
  // Simulate a small delay like a real API call
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return NextResponse.json(mockScoreboardData);
}
