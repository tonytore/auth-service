
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
    console.error(error);
    throw error;
  }
}
};
