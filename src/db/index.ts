import { Pool } from "pg";
import { config } from "../config";

export const pool = new Pool({
  connectionString: config.connectionString,
});

export const connectDB = async () => {
  try {
    // Create users table if it doesn't exist
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(20) DEFAULT 'contributor' NOT NULL,

            createdAt TIMESTAMP DEFAULT NOW(),
            updatedAt TIMESTAMP DEFAULT NOW()
        )
    `);

    // Create Issues table if it doesn't exist
    await pool.query(`
        CREATE TABLE IF NOT EXISTS issues (
            id SERIAL PRIMARY KEY,
            title VARCHAR(150) NOT NULL,
            description TEXT CHECK(LENGTH(description) >= 20) NOT NULL,
            type VARCHAR(20) NOT NULL,
            status VARCHAR(20) DEFAULT 'open' NOT NULL,
            reporter_id VARCHAR(20) NOT NULL,
            
            createdAt TIMESTAMP DEFAULT NOW(),
            updatedAt TIMESTAMP DEFAULT NOW()
        )
    `);

    console.log("Database connected successfully.");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};
