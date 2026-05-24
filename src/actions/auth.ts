"use server";

import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";

export async function register(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;

    if (!name || !email || !password || !role) {
        throw new Error("Missing required fields");
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
        name,
        email,
        password: hashedPassword,
        role,
    });

    // Attempt to sign in directly after registration
    try {
        await signIn("credentials", {
            email,
            password,
            redirect: false,
        });
    } catch (error) {
        // Signin sometimes throws a redirect error which is expected
        // But here we might just want to return success and let the client redirect
        console.log("Auto-login error (expected if redirecting):", error);
    }
}

export async function login(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        throw new Error("Missing required fields");
    }

    await signIn("credentials", {
        email,
        password,
        redirectTo: "/dashboard",
    });
}
