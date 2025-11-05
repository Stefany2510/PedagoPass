"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const me_1 = __importDefault(require("./routes/me"));
const communities_1 = __importDefault(require("./routes/communities"));
const reservations_1 = __importDefault(require("./routes/reservations"));
const orders_1 = __importDefault(require("./routes/orders"));
const r = (0, express_1.Router)();
r.use('/me', me_1.default);
r.use('/communities', communities_1.default);
r.use('/reservations', reservations_1.default);
r.use('/orders', orders_1.default);
exports.default = r;
//# sourceMappingURL=routes.js.map