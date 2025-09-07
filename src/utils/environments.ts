import { config } from 'dotenv';
config();

export const PORT = process.env.PORT || 3000;

export const DB_TYPE = process.env.DB_TYPE || 'postgres';
export const DB_HOST = process.env.DB_HOST;
export const DB_PORT = Number(process.env.DB_PORT) || 5432;
export const DB_USERNAME = process.env.DB_USERNAME;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_NAME = process.env.DB_NAME;

export const THROTTLE_TTL = Number(process.env.THROTTLE_TTL) || 60000;
export const THROTTLE_LIMIT = Number(process.env.THROTTLE_LIMIT) || 10;

// Supabase configuration
export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_KEY = process.env.SUPABASE_KEY;
export const SUPABASE_STORAGE_BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET || 'images';
