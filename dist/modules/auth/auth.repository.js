"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRepository = void 0;
const db_1 = require("../../config/db");
exports.authRepository = {
    findByEmail: async (email) => {
        return db_1.db.user.findUnique({
            where: { email },
        });
    },
    createUser: async (data) => {
        return db_1.db.user.create({
            data,
        });
    },
    listUserRepository: async () => {
        try {
            const users = await db_1.db.user.findMany({
                orderBy: {
                    createdAt: "desc",
                },
            });
            const filteredUsers = users.map((user) => {
                const { password: _password, ...other } = user;
                void _password;
                return other;
            });
            return filteredUsers;
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    },
};
