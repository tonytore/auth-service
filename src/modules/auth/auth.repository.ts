import { logger } from "@/utils/logger/logger";
import { db } from "../../config/db";
import { UserData } from "./auth.service";

export const authRepository = {
  findByEmail: async (email: string) => {
    return db.user.findUnique({
      where: { email },
    });
  },

  createUser: async (data: UserData) => {
    return db.user.create({
      data,
    });
  },
  listUserRepository: async () => {
    try {
      const users = await db.user.findMany({
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
    } catch (error) {
      logger.info(error);
      throw error;
    }
  },
  findById: async (userId: string) => {
    return db.user.findUnique({
      where: { id: userId },
    });
  },

};
