
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
};
