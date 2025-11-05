import 'dotenv/config';

const rawPort = Number(process.env.PORT);

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = Number.isFinite(rawPort) && rawPort > 0 ? rawPort : 8080;
export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
export const DATABASE_URL = process.env.DATABASE_URL || '';
export const LOG_LEVEL = process.env.LOG_LEVEL || (NODE_ENV === 'production' ? 'info' : 'debug');
export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

const allowList = (process.env.CORS_ORIGIN || 'http://localhost:3000')
	.split(',')
	.map((entry) => entry.trim())
	.filter(Boolean);

export const CORS_ALLOW_LIST = allowList.length > 0 ? allowList : ['http://localhost:3000'];
