"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionRepository = void 0;
const db_1 = require("@/config/db");
exports.sessionRepository = {
    create: async (data) => {
        return db_1.db.session.create({
            data,
        });
    },
    findByRefreshToken: async (refreshToken) => {
        return db_1.db.session.findUnique({
            where: { refreshToken },
        });
    },
    revokeSession: async (id) => {
        return db_1.db.session.update({
            where: { id },
            data: { isRevoked: true },
        });
    },
};
