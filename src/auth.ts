import NextAuth, { User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import connectDB from "./lib/db";
import UserModel from "./models/User";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                await connectDB();

                const user = await UserModel.findOne({
                    email: credentials.email,
                });

                if (!user || !user.password) {
                    //   throw new Error("User not found.");
                    return null;
                }

                const isPasswordCorrect = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!isPasswordCorrect) {
                    //   throw new Error("Invalid credentials.");
                    return null;
                }

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                } as User & { role: string; id: string };
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
});
