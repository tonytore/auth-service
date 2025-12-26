import joi from "joi";

export const registerSchema = joi.object({
  body: joi.object({
    email: joi
      .string()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .required(),
    password: joi
      .string()
      .pattern(new RegExp("^[a-zA-Z0-9]{6,30}$"))
      .required(),
    name: joi.string().min(2).max(50).optional(),
    avatarUrl: joi.string().optional(),
    role: joi.string().optional(),
  }),
});

export const loginSchema = joi.object({
  body: joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
  }),
});
