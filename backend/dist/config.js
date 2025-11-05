"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CORS_ALLOW_LIST = exports.CORS_ORIGIN = exports.LOG_LEVEL = exports.DATABASE_URL = exports.JWT_SECRET = exports.PORT = exports.NODE_ENV = void 0;
require("dotenv/config");
const rawPort = Number(process.env.PORT);
exports.NODE_ENV = process.env.NODE_ENV || 'development';
exports.PORT = Number.isFinite(rawPort) && rawPort > 0 ? rawPort : 8080;
exports.JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
exports.DATABASE_URL = process.env.DATABASE_URL || '';
exports.LOG_LEVEL = process.env.LOG_LEVEL || (exports.NODE_ENV === 'production' ? 'info' : 'debug');
exports.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
const allowList = (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
exports.CORS_ALLOW_LIST = allowList.length > 0 ? allowList : ['http://localhost:3000'];
//# sourceMappingURL=config.js.map