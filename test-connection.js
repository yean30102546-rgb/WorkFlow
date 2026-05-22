const postgres = require('postgres');
const dotenv = require('dotenv');
dotenv.config();

const connectionString = process.env.DATABASE_URL;
console.log('Testing connection to database...');
console.log('Host/Port from connection string:', connectionString ? connectionString.split('@')[1] : 'undefined');

const sql = postgres(connectionString, { 
  max: 1, 
  connect_timeout: 5,
  prepare: false 
});

async function run() {
  try {
    const result = await sql`SELECT NOW()`;
    console.log('✅ Connection Successful! Current time from DB:', result[0].now);
  } catch (error) {
    console.error('❌ Connection Failed with error:');
    console.error(error);
  } finally {
    await sql.end();
  }
}

run();
