import { connectToDatabase } from '@/app/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const db = await connectToDatabase();
    const surveys = await db.collection("surveys").find({}, { projection: { questions: 1 } }).toArray();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const questions = surveys.map((survey: any) => survey.questions).flat();

    return NextResponse.json(Array.isArray(questions) ? questions : []);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}