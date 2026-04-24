import { NextRequest, NextResponse } from 'next/server';
import { getAllShifts, getShift } from '@/lib/db/origins';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const shift = await getShift(id);
      if (!shift) {
        return NextResponse.json(
          { error: 'Shift not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(shift);
    }

    const shifts = await getAllShifts();
    return NextResponse.json(shifts);
  } catch (error) {
    console.error('Error fetching shifts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shifts' },
      { status: 500 }
    );
  }
}
