import { prisma } from './src/lib/prisma.js';

export { prisma };

export interface PGUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'CONSUMER' | 'DESIGNER' | 'MANUFACTURER' | 'ADMIN';
  username?: string;
  created_at?: Date;
}

export async function initDb() {
  console.log('Initializing PostgreSQL database with Prisma...');
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS offgrid_users (
        id VARCHAR(50) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        username VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS offgrid_designs (
        id VARCHAR(80) PRIMARY KEY,
        designer_id VARCHAR(80) NOT NULL,
        designer_name VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        file_url TEXT NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        tags JSONB NOT NULL,
        preferred_product_type VARCHAR(50),
        workflow_status VARCHAR(50) NOT NULL,
        moderation_status VARCHAR(50) NOT NULL,
        admin_reviewed_by VARCHAR(80),
        admin_reviewed_at TIMESTAMP,
        admin_notes TEXT,
        winning_bid_id VARCHAR(80),
        winning_manufacturer_id VARCHAR(80),
        live_product_id VARCHAR(80),
        current_round INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS offgrid_products (
        id VARCHAR(80) PRIMARY KEY,
        design_id VARCHAR(80) NOT NULL,
        designer_id VARCHAR(80) NOT NULL,
        designer_name VARCHAR(255) NOT NULL,
        manufacturer_id VARCHAR(80),
        slug VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        product_type VARCHAR(50) NOT NULL,
        image TEXT NOT NULL,
        base_cost_inr INTEGER NOT NULL,
        designer_price_inr INTEGER NOT NULL,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        featured BOOLEAN NOT NULL DEFAULT FALSE,
        total_sold INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS offgrid_orders (
        id VARCHAR(80) PRIMARY KEY,
        consumer_id VARCHAR(80) NOT NULL,
        consumer_name VARCHAR(255) NOT NULL,
        consumer_email VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL,
        items JSONB NOT NULL,
        shipping_address JSONB NOT NULL,
        subtotal_inr INTEGER NOT NULL,
        shipping_inr INTEGER NOT NULL,
        total_inr INTEGER NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        payment_id VARCHAR(120),
        tracking_number VARCHAR(120),
        courier_name VARCHAR(120),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS offgrid_design_bids (
        id VARCHAR(80) PRIMARY KEY,
        design_id VARCHAR(80) NOT NULL,
        manufacturer_id VARCHAR(80) NOT NULL,
        manufacturer_name VARCHAR(255) NOT NULL,
        bid_amount_inr INTEGER NOT NULL,
        turn_around_days INTEGER NOT NULL,
        status VARCHAR(50) NOT NULL,
        sample_status VARCHAR(50),
        sample_image_url TEXT,
        sample_notes TEXT,
        held_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS offgrid_design_samples (
        id VARCHAR(80) PRIMARY KEY,
        design_id VARCHAR(80) NOT NULL,
        bid_id VARCHAR(80) NOT NULL,
        manufacturer_id VARCHAR(80) NOT NULL,
        designer_id VARCHAR(80) NOT NULL,
        status VARCHAR(50) NOT NULL,
        sample_cost_split VARCHAR(255),
        image_url TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP,
        reviewed_by VARCHAR(80)
      );

      CREATE TABLE IF NOT EXISTS offgrid_moderation_records (
        user_id VARCHAR(80) PRIMARY KEY,
        role VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        reason TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by VARCHAR(80)
      );

      CREATE TABLE IF NOT EXISTS offgrid_notifications (
        id VARCHAR(80) PRIMARY KEY,
        user_id VARCHAR(80) NOT NULL,
        role VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        link TEXT,
        read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE IF EXISTS offgrid_designs ADD COLUMN IF NOT EXISTS admin_notes TEXT;
      ALTER TABLE IF EXISTS offgrid_designs ADD COLUMN IF NOT EXISTS admin_reviewed_by VARCHAR(80);
      ALTER TABLE IF EXISTS offgrid_designs ADD COLUMN IF NOT EXISTS admin_reviewed_at TIMESTAMP;
      ALTER TABLE IF EXISTS offgrid_designs ADD COLUMN IF NOT EXISTS preferred_product_type VARCHAR(50);
      ALTER TABLE IF EXISTS offgrid_designs ADD COLUMN IF NOT EXISTS winning_bid_id VARCHAR(80);
      ALTER TABLE IF EXISTS offgrid_designs ADD COLUMN IF NOT EXISTS winning_manufacturer_id VARCHAR(80);
      ALTER TABLE IF EXISTS offgrid_designs ADD COLUMN IF NOT EXISTS live_product_id VARCHAR(80);
      ALTER TABLE IF EXISTS offgrid_designs ADD COLUMN IF NOT EXISTS current_round INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE IF EXISTS offgrid_designs ADD COLUMN IF NOT EXISTS file_type VARCHAR(50);
      ALTER TABLE IF EXISTS offgrid_designs ADD COLUMN IF NOT EXISTS file_url TEXT;
      ALTER TABLE IF EXISTS offgrid_designs ADD COLUMN IF NOT EXISTS designer_id VARCHAR(80);
      ALTER TABLE IF EXISTS offgrid_designs ADD COLUMN IF NOT EXISTS designer_name VARCHAR(255);
      ALTER TABLE IF EXISTS offgrid_designs ADD COLUMN IF NOT EXISTS workflow_status VARCHAR(50);
      ALTER TABLE IF EXISTS offgrid_designs ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(50);
      ALTER TABLE IF EXISTS offgrid_designs ADD COLUMN IF NOT EXISTS tags JSONB;
      ALTER TABLE IF EXISTS offgrid_designs ALTER COLUMN current_round SET DEFAULT 0;

      ALTER TABLE IF EXISTS offgrid_products ADD COLUMN IF NOT EXISTS design_id VARCHAR(80);
      ALTER TABLE IF EXISTS offgrid_products ADD COLUMN IF NOT EXISTS designer_id VARCHAR(80);
      ALTER TABLE IF EXISTS offgrid_products ADD COLUMN IF NOT EXISTS designer_name VARCHAR(255);
      ALTER TABLE IF EXISTS offgrid_products ADD COLUMN IF NOT EXISTS manufacturer_id VARCHAR(80);
      ALTER TABLE IF EXISTS offgrid_products ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
      ALTER TABLE IF EXISTS offgrid_products ADD COLUMN IF NOT EXISTS title VARCHAR(255);
      ALTER TABLE IF EXISTS offgrid_products ADD COLUMN IF NOT EXISTS description TEXT;
      ALTER TABLE IF EXISTS offgrid_products ADD COLUMN IF NOT EXISTS product_type VARCHAR(50);
      ALTER TABLE IF EXISTS offgrid_products ADD COLUMN IF NOT EXISTS image TEXT;
      ALTER TABLE IF EXISTS offgrid_products ADD COLUMN IF NOT EXISTS base_cost_inr INTEGER;
      ALTER TABLE IF EXISTS offgrid_products ADD COLUMN IF NOT EXISTS designer_price_inr INTEGER;
      ALTER TABLE IF EXISTS offgrid_products ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;
      ALTER TABLE IF EXISTS offgrid_products ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE;
      ALTER TABLE IF EXISTS offgrid_products ADD COLUMN IF NOT EXISTS total_sold INTEGER NOT NULL DEFAULT 0;

      ALTER TABLE IF EXISTS offgrid_orders ADD COLUMN IF NOT EXISTS consumer_id VARCHAR(80);
      ALTER TABLE IF EXISTS offgrid_orders ADD COLUMN IF NOT EXISTS consumer_name VARCHAR(255);
      ALTER TABLE IF EXISTS offgrid_orders ADD COLUMN IF NOT EXISTS consumer_email VARCHAR(255);
      ALTER TABLE IF EXISTS offgrid_orders ADD COLUMN IF NOT EXISTS status VARCHAR(50);
      ALTER TABLE IF EXISTS offgrid_orders ADD COLUMN IF NOT EXISTS items JSONB;
      ALTER TABLE IF EXISTS offgrid_orders ADD COLUMN IF NOT EXISTS shipping_address JSONB;
      ALTER TABLE IF EXISTS offgrid_orders ADD COLUMN IF NOT EXISTS subtotal_inr INTEGER;
      ALTER TABLE IF EXISTS offgrid_orders ADD COLUMN IF NOT EXISTS shipping_inr INTEGER;
      ALTER TABLE IF EXISTS offgrid_orders ADD COLUMN IF NOT EXISTS total_inr INTEGER;
      ALTER TABLE IF EXISTS offgrid_orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
      ALTER TABLE IF EXISTS offgrid_orders ADD COLUMN IF NOT EXISTS payment_id VARCHAR(120);
      ALTER TABLE IF EXISTS offgrid_orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(120);
      ALTER TABLE IF EXISTS offgrid_orders ADD COLUMN IF NOT EXISTS courier_name VARCHAR(120);

      ALTER TABLE IF EXISTS offgrid_design_bids ADD COLUMN IF NOT EXISTS design_id VARCHAR(80);
      ALTER TABLE IF EXISTS offgrid_design_bids ADD COLUMN IF NOT EXISTS manufacturer_id VARCHAR(80);
      ALTER TABLE IF EXISTS offgrid_design_bids ADD COLUMN IF NOT EXISTS manufacturer_name VARCHAR(255);
      ALTER TABLE IF EXISTS offgrid_design_bids ADD COLUMN IF NOT EXISTS bid_amount_inr INTEGER;
      ALTER TABLE IF EXISTS offgrid_design_bids ADD COLUMN IF NOT EXISTS turn_around_days INTEGER;
      ALTER TABLE IF EXISTS offgrid_design_bids ADD COLUMN IF NOT EXISTS status VARCHAR(50);
      ALTER TABLE IF EXISTS offgrid_design_bids ADD COLUMN IF NOT EXISTS sample_status VARCHAR(50);
      ALTER TABLE IF EXISTS offgrid_design_bids ADD COLUMN IF NOT EXISTS sample_image_url TEXT;
      ALTER TABLE IF EXISTS offgrid_design_bids ADD COLUMN IF NOT EXISTS sample_notes TEXT;
      ALTER TABLE IF EXISTS offgrid_design_bids ADD COLUMN IF NOT EXISTS held_reason TEXT;

      ALTER TABLE IF EXISTS offgrid_design_samples ADD COLUMN IF NOT EXISTS design_id VARCHAR(80);
      ALTER TABLE IF EXISTS offgrid_design_samples ADD COLUMN IF NOT EXISTS bid_id VARCHAR(80);
      ALTER TABLE IF EXISTS offgrid_design_samples ADD COLUMN IF NOT EXISTS manufacturer_id VARCHAR(80);
      ALTER TABLE IF EXISTS offgrid_design_samples ADD COLUMN IF NOT EXISTS designer_id VARCHAR(80);
      ALTER TABLE IF EXISTS offgrid_design_samples ADD COLUMN IF NOT EXISTS status VARCHAR(50);
      ALTER TABLE IF EXISTS offgrid_design_samples ADD COLUMN IF NOT EXISTS sample_cost_split VARCHAR(255);
      ALTER TABLE IF EXISTS offgrid_design_samples ADD COLUMN IF NOT EXISTS image_url TEXT;
      ALTER TABLE IF EXISTS offgrid_design_samples ADD COLUMN IF NOT EXISTS notes TEXT;
      ALTER TABLE IF EXISTS offgrid_design_samples ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;
      ALTER TABLE IF EXISTS offgrid_design_samples ADD COLUMN IF NOT EXISTS reviewed_by VARCHAR(80);

      ALTER TABLE IF EXISTS offgrid_moderation_records ADD COLUMN IF NOT EXISTS user_id VARCHAR(80);
      ALTER TABLE IF EXISTS offgrid_moderation_records ADD COLUMN IF NOT EXISTS role VARCHAR(50);
      ALTER TABLE IF EXISTS offgrid_moderation_records ADD COLUMN IF NOT EXISTS status VARCHAR(50);
      ALTER TABLE IF EXISTS offgrid_moderation_records ADD COLUMN IF NOT EXISTS reason TEXT;
      ALTER TABLE IF EXISTS offgrid_moderation_records ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;
      ALTER TABLE IF EXISTS offgrid_moderation_records ADD COLUMN IF NOT EXISTS updated_by VARCHAR(80);

      ALTER TABLE IF EXISTS offgrid_notifications ADD COLUMN IF NOT EXISTS user_id VARCHAR(80);
      ALTER TABLE IF EXISTS offgrid_notifications ADD COLUMN IF NOT EXISTS role VARCHAR(50);
      ALTER TABLE IF EXISTS offgrid_notifications ADD COLUMN IF NOT EXISTS title VARCHAR(255);
      ALTER TABLE IF EXISTS offgrid_notifications ADD COLUMN IF NOT EXISTS message TEXT;
      ALTER TABLE IF EXISTS offgrid_notifications ADD COLUMN IF NOT EXISTS category VARCHAR(50);
      ALTER TABLE IF EXISTS offgrid_notifications ADD COLUMN IF NOT EXISTS link TEXT;
      ALTER TABLE IF EXISTS offgrid_notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMP;
      ALTER TABLE IF EXISTS offgrid_notifications ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);
    console.log('Persistent tables checked/created.');
  } catch (error) {
    console.error('Failed to initialize Neon PostgreSQL database:', error);
  }
}
