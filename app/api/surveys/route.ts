import { connectToDatabase } from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    const db = await connectToDatabase();
    const surveys = await db.collection("surveys").find({}).toArray();
    return Response.json(Array.isArray(surveys) ? surveys : []);
  } catch (error) {
    console.error('Failed to fetch surveys:', error);
    return Response.json([]); // Return empty array instead of error object
  }
}

export async function POST(request: Request) {
  try {
    const surveyData = await request.json();
    const db = await connectToDatabase();
    const result = await db.collection('surveys').insertOne(surveyData);
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: 'Failed to create survey' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...updateData } = await request.json();
    const db = await connectToDatabase();
    const result = await db.collection('surveys').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: 'Failed to update survey' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const db = await connectToDatabase();
    const result = await db.collection('surveys').deleteOne({ _id: new ObjectId(id) });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: 'Failed to delete survey' }, { status: 500 });
  }
}