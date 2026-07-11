import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL not found in environment variables');
  process.exit(1);
}

const sql = postgres(connectionString);

async function resetDatabase() {
  console.log('🗑️  Dropping all tables...');
  
  try {
    // Drop all tables in the correct order to handle foreign key constraints
    await sql`DROP TABLE IF EXISTS waitlist CASCADE`;
    await sql`DROP TABLE IF EXISTS availability_patterns CASCADE`;
    await sql`DROP TABLE IF EXISTS coupons CASCADE`;
    await sql`DROP TABLE IF EXISTS gallery CASCADE`;
    await sql`DROP TABLE IF EXISTS events CASCADE`;
    await sql`DROP TABLE IF EXISTS menu_items CASCADE`;
    await sql`DROP TABLE IF EXISTS menu_categories CASCADE`;
    await sql`DROP TABLE IF EXISTS reservations CASCADE`;
    await sql`DROP TABLE IF EXISTS settings CASCADE`;
    await sql`DROP TABLE IF EXISTS users CASCADE`;
    
    console.log('✅ All tables dropped successfully');
  } catch (error) {
    console.error('❌ Error dropping tables:', error);
    throw error;
  } finally {
    await sql.end();
  }
  process.exit(0);
}

resetDatabase().catch((error) => {
  console.error('❌ Reset failed:', error);
  process.exit(1);
});
