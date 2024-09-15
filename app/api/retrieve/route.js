import { NextResponse } from 'next/server';
import { queryDatabase } from '../../lib/db';
import { use } from 'react';

export async function POST(req) {
  try {
    // Parse the request body
    const { userEmbedding } = await req.json();

    if (!userEmbedding || !Array.isArray(userEmbedding)) {
      console.log("INVALID EMBEDDING FORMAT")
      return res.status(400).json({ error: 'Invalid embedding format' });
    }

    // Ensure that the userEmbedding is an array of numbers
    const isNumericArray = userEmbedding.every(num => typeof num === 'number');
    if (!isNumericArray) {
      console.log("EMBEDDING MUST BE NUMERIC");
      return NextResponse.json({ error: 'Embedding must be an array of numbers' }, { status: 400 });
    }

    // Build the query string
    const dbQuery = `
      SELECT title, content
      FROM embeddings
      ORDER BY embedding <=> $1::vector
      LIMIT 5;
    `;


    // Execute the database query
    const results = await queryDatabase(dbQuery, [userEmbedding]);

    // Return the results as a JSON response
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error handling request:', error);
    return NextResponse.json({ error: 'Failed to process the request' }, { status: 500 });
  }
}
