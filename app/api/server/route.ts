import { connectToDatabase } from '@/app/lib/mongodb';

export async function GET() {
    try {
        const db = await connectToDatabase();
        const surveys = await db.collection("server").find({}).toArray();
        return Response.json(Array.isArray(surveys) ? surveys : []);
    } catch {
        console.error('Failed to fetch surveys:');
        return Response.json([]); // Return empty array instead of error object
    }
}
export async function PUT(request: Request) {
    try {
      const { id, ...updateData } = await request.json();
      const db = await connectToDatabase();
      const result = await db.collection('server').updateOne(
        { _id: id },
        { $set: updateData }
      );
      return Response.json(result);
    } catch {
        console.error('Failed to update survey:');
      return Response.json({ error: 'Failed to update survey' }, { status: 500 });
    }
  }