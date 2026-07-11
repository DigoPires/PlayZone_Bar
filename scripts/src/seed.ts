import postgres from 'postgres';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL not found in environment variables');
  console.error('Please run: DATABASE_URL="your_connection_string" pnpm --filter @workspace/scripts seed');
  process.exit(1);
}

// Log which database is being seeded (without exposing password)
try {
  const dbUrl = new URL(connectionString);
  const host = dbUrl.hostname;
  const dbName = dbUrl.pathname?.replace(/^\//, '') || 'unknown';
  console.log(`🌱 Seeding database: ${host}/${dbName}`);
} catch (e) {
  console.log(`🌱 Starting seed...`);
}

const sql = postgres(connectionString);

async function seed() {
  try {
    // Test connection first
    try {
      await sql`SELECT 1`;
      console.log('✅ Database connection successful');
    } catch (error: any) {
      console.error('❌ Failed to connect to database:', error.message);
      throw error;
    }

    // Delete existing users and create new admin user
    await sql`DELETE FROM users`;
    
    // Hash the password
    const passwordHash = await bcrypt.hash('teste12', 10);
    
    await sql`
      INSERT INTO users (username, name, password_hash, role)
      VALUES ('admin', 'Admin', ${passwordHash}, 'admin')
    `;
    console.log('✅ Created admin user: admin');

    // Create menu categories
    const existingCategories = await sql`SELECT * FROM menu_categories LIMIT 1`;
    if (existingCategories.length === 0) {
      await sql`
        INSERT INTO menu_categories (name, "order")
        VALUES 
          ('Drinks', 1),
          ('Petiscos', 2),
          ('Pratos Principais', 3),
          ('Sobremesas', 4)
      `;
      console.log('✅ Created menu categories');
    } else {
      console.log('ℹ️  Categories already exist, skipping');
    }

    // Get categories
    const categories = await sql`SELECT * FROM menu_categories`;
    const drinksCategory = categories.find((c: any) => c.name === 'Drinks');
    const petiscosCategory = categories.find((c: any) => c.name === 'Petiscos');

    // Create menu items
    const existingItems = await sql`SELECT * FROM menu_items LIMIT 1`;
    if (existingItems.length === 0) {
      await sql`
        INSERT INTO menu_items (name, description, price, category_id, available)
        VALUES 
          ('Caipirinha Clássica', 'Cachaça, limão, açúcar e gelo', 25, ${drinksCategory?.id || 1}, true),
          ('Mojito', 'Rum, hortelã, limão, açúcar e água com gás', 28, ${drinksCategory?.id || 1}, true),
          ('Batata Frita', 'Batatas crocantes com maionese da casa', 22, ${petiscosCategory?.id || 2}, true),
          ('Nachos com Guacamole', 'Tortilhas com guacamole fresco e queijo', 32, ${petiscosCategory?.id || 2}, true)
      `;
      console.log('✅ Created menu items');
    } else {
      console.log('ℹ️  Menu items already exist, skipping');
    }

    // Check if new columns exist, add them if they don't
    const columns = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'settings'`;
    const columnNames = columns.map((c: any) => c.column_name);
    
    const needsColumns = !columnNames.includes('hero_title_purple') || !columnNames.includes('hero_title_white');
    
    if (needsColumns) {
      if (!columnNames.includes('hero_title_purple')) {
        await sql`ALTER TABLE settings ADD COLUMN hero_title_purple text`;
        console.log('✅ Added hero_title_purple column');
      }
      if (!columnNames.includes('hero_title_white')) {
        await sql`ALTER TABLE settings ADD COLUMN hero_title_white text`;
        console.log('✅ Added hero_title_white column');
      }
      // Close connection to clear cached plans after schema change
      await sql.end({ timeout: 5 });
      const newSql = postgres(connectionString!);
      await newSql`SELECT 1`;
      Object.assign(sql, newSql);
      sql.end = newSql.end.bind(newSql);
    }

    // Create settings
    const existingSettings = await sql`SELECT id, hero_title_purple, hero_title_white FROM settings LIMIT 1`;
    if (existingSettings.length === 0) {
      await sql`
        INSERT INTO settings (hero_title_purple, hero_title_white, hero_subtitle, about_text, entry_price, opening_hours, whatsapp, instagram, facebook, address)
        VALUES (
          'PLAY',
          'ZONE',
          'O melhor lounge de esports de Itapeva. Experiência premium de jogos, fliperamas clássicos e coquetelaria mixológica.',
          'A PlayZone nasceu da paixão pelos games e da vontade de criar um espaço onde a cultura gamer e a vida noturna se encontram. Não somos um bar com alguns fliperamas no canto. Somos uma arena de entretenimento.',
          20,
          'Ter a Dom: 18h às 02h',
          '11999999999',
          'https://instagram.com/playzonebar',
          'https://facebook.com/playzonebar',
          'Rua dos Gamers, 123 - São Paulo, SP'
        )
      `;
      console.log('✅ Created settings');
    } else {
      // Update existing settings with new values only if they're null
      await sql`
        UPDATE settings 
        SET hero_title_purple = COALESCE(hero_title_purple, 'PLAY'),
            hero_title_white = COALESCE(hero_title_white, 'ZONE')
      `;
      console.log('✅ Updated hero title');
    }

    console.log('🎉 Seed completed successfully!');
  } catch (error: any) {
    console.error('❌ Seed failed:', error.message);
    if (error.code === 'ENOTFOUND') {
      console.error('💡 Hint: Cannot connect to database host. Check DATABASE_URL and network connectivity.');
    } else if (error.message?.includes('does not exist')) {
      console.error('💡 Hint: Database table does not exist. Run migrations first with: pnpm --filter @workspace/db push');
    } else if (error.message?.includes('authentication failed')) {
      console.error('💡 Hint: Authentication failed. Check DATABASE_URL credentials and Neon connection settings.');
    }
    throw error;
  } finally {
    await sql.end();
  }
  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error.message);
  process.exit(1);
});

    // Create menu categories
    const existingCategories = await sql`SELECT * FROM menu_categories LIMIT 1`;
    if (existingCategories.length === 0) {
      await sql`
        INSERT INTO menu_categories (name, "order")
        VALUES 
          ('Drinks', 1),
          ('Petiscos', 2),
          ('Pratos Principais', 3),
          ('Sobremesas', 4)
      `;
      console.log('✅ Created menu categories');
    } else {
      console.log('ℹ️  Categories already exist, skipping');
    }

    // Get categories
    const categories = await sql`SELECT * FROM menu_categories`;
    const drinksCategory = categories.find((c: any) => c.name === 'Drinks');
    const petiscosCategory = categories.find((c: any) => c.name === 'Petiscos');

    // Create menu items
    const existingItems = await sql`SELECT * FROM menu_items LIMIT 1`;
    if (existingItems.length === 0) {
      await sql`
        INSERT INTO menu_items (name, description, price, category_id, available)
        VALUES 
          ('Caipirinha Clássica', 'Cachaça, limão, açúcar e gelo', 25, ${drinksCategory?.id || 1}, true),
          ('Mojito', 'Rum, hortelã, limão, açúcar e água com gás', 28, ${drinksCategory?.id || 1}, true),
          ('Batata Frita', 'Batatas crocantes com maionese da casa', 22, ${petiscosCategory?.id || 2}, true),
          ('Nachos com Guacamole', 'Tortilhas com guacamole fresco e queijo', 32, ${petiscosCategory?.id || 2}, true)
      `;
      console.log('✅ Created menu items');
    } else {
      console.log('ℹ️  Menu items already exist, skipping');
    }

    // Check if new columns exist, add them if they don't
    const columns = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'settings'`;
    const columnNames = columns.map((c: any) => c.column_name);
    
    const needsColumns = !columnNames.includes('hero_title_purple') || !columnNames.includes('hero_title_white');
    
    if (needsColumns) {
      if (!columnNames.includes('hero_title_purple')) {
        await sql`ALTER TABLE settings ADD COLUMN hero_title_purple text`;
        console.log('✅ Added hero_title_purple column');
      }
      if (!columnNames.includes('hero_title_white')) {
        await sql`ALTER TABLE settings ADD COLUMN hero_title_white text`;
        console.log('✅ Added hero_title_white column');
      }
      // Close connection to clear cached plans after schema change
      await sql.end({ timeout: 5 });
      const newSql = postgres(connectionString!);
      await newSql`SELECT 1`;
      Object.assign(sql, newSql);
      sql.end = newSql.end.bind(newSql);
    }

    // Create settings
    const existingSettings = await sql`SELECT id, hero_title_purple, hero_title_white FROM settings LIMIT 1`;
    if (existingSettings.length === 0) {
      await sql`
        INSERT INTO settings (hero_title_purple, hero_title_white, hero_subtitle, about_text, entry_price, opening_hours, whatsapp, instagram, facebook, address)
        VALUES (
          'PLAY',
          'ZONE',
          'O melhor lounge de esports de Itapeva. Experiência premium de jogos, fliperamas clássicos e coquetelaria mixológica.',
          'A PlayZone nasceu da paixão pelos games e da vontade de criar um espaço onde a cultura gamer e a vida noturna se encontram. Não somos um bar com alguns fliperamas no canto. Somos uma arena de entretenimento.',
          20,
          'Ter a Dom: 18h às 02h',
          '11999999999',
          'https://instagram.com/playzonebar',
          'https://facebook.com/playzonebar',
          'Rua dos Gamers, 123 - São Paulo, SP'
        )
      `;
      console.log('✅ Created settings');
    } else {
      // Update existing settings with new values only if they're null
      await sql`
        UPDATE settings 
        SET hero_title_purple = COALESCE(hero_title_purple, 'PLAY'),
            hero_title_white = COALESCE(hero_title_white, 'ZONE')
      `;
      console.log('✅ Updated hero title');
    }

    console.log('🎉 Seed completed!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
