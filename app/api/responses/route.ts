import { connectToDatabase } from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const responseData = await request.json();
    const db = await connectToDatabase();
    const result = await db.collection('responses').insertOne({
      ...responseData,
      timestamp: new Date(),
      otherSpecifies: responseData.answers
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to save response' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = await connectToDatabase();
    const responses = await db.collection('responses')
      .aggregate([
        {
          $lookup: {
            from: "surveys",
            localField: "surveyId",
            foreignField: "_id",
            as: "survey"
          }
        }
      ]).toArray();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedResponses = await Promise.all(responses.map(async (response: Record<string, any>) => {
      if (!response.surveyId) return response;
      const surveyId = new ObjectId(response.surveyId.toString());
      const surveyTitle = await db.collection('surveys').findOne({ _id: surveyId });
      return { ...response, title: surveyTitle ? surveyTitle.title : null };
    }));

    return NextResponse.json(updatedResponses);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  console.log('DELETE');
  try {
    const { id } = await request.json();
    const db = await connectToDatabase();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const result = await db.collection('responses').deleteOne({ _id: new ObjectId(id) });
    // console.log(NextResponse.json(result));
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to delete survey' }, { status: 500 });
  }
}
