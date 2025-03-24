import { z } from "zod";

const signUpSchema = z
  .object({
    name: z.string().toLowerCase(),
    email: z.string().email({ message: "Invalid email address" }).toLowerCase(),
    password: z
      .string()
      .min(8, { message: "Must be 8 or more characters long" }),
    confirmPassword: z
      .string()
      .min(8, { message: "Does not match the password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords Don't match",
    path: ["confirmPassword"],
  });

const signinSchema = z.object({
  email: z.string().email({ message: "Invalid Email Address" }).toLowerCase(),
  password: z.string().min(8, { message: "Password is Incorrect" }),
});

export { signUpSchema, signinSchema };
