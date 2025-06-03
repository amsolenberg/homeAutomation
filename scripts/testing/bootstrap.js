import dotenv from 'dotenv';
import path from 'path';

// Explicitly load the .env file located two levels above the current working directory
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
