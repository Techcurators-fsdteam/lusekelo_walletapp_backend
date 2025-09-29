const { MongoClient } = require('mongodb');
require('dotenv').config();

async function dropFullNameIndex() {
  const client = new MongoClient(process.env.MONGO_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const collection = db.collection('users');
    
    // List existing indexes
    const indexes = await collection.indexes();
    console.log('Existing indexes:', indexes.map(idx => idx.name));
    
    // Check if fullName_1 index exists and drop it
    const fullNameIndexExists = indexes.some(idx => idx.name === 'fullName_1');
    
    if (fullNameIndexExists) {
      await collection.dropIndex('fullName_1');
      console.log('Successfully dropped fullName_1 index');
    } else {
      console.log('fullName_1 index does not exist');
    }
    
    // List indexes after dropping
    const indexesAfter = await collection.indexes();
    console.log('Indexes after dropping:', indexesAfter.map(idx => idx.name));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

dropFullNameIndex();
