"use server";

import connectDB from "@/lib/db";
import Classroom from "@/models/Classroom";
import Enrollment from "@/models/Enrollment";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

function generateCode(length: number = 6) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export async function createClassroom(formData: FormData) {
    const session = await auth();
    if (!session || !session.user || session.user.role !== "TEACHER") {
        throw new Error("Unauthorized: Only teachers can create classrooms");
    }

    const name = formData.get("name") as string;
    if (!name) {
        throw new Error("Classroom name is required");
    }

    await connectDB();

    let code = generateCode();
    let existingClass = await Classroom.findOne({ code });

    // Simple retry loop (could be more robust)
    while (existingClass) {
        code = generateCode();
        existingClass = await Classroom.findOne({ code });
    }

    await Classroom.create({
        name,
        code,
        teacherId: session.user.id,
    });

    revalidatePath("/dashboard");
}

export async function joinClassroom(formData: FormData) {
    const session = await auth();
    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }

    // Optional: Enforce only students can join? 
    // For now let's allow anyone (even teachers can join other classes as students)

    const code = formData.get("code") as string;
    if (!code) {
        throw new Error("Class code is required");
    }

    await connectDB();

    const classroom = await Classroom.findOne({ code });
    if (!classroom) {
        throw new Error("Classroom not found");
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
        studentId: session.user.id,
        classroomId: classroom._id,
    });

    if (existingEnrollment) {
        throw new Error("You are already enrolled in this class");
    }

    await Enrollment.create({
        studentId: session.user.id,
        classroomId: classroom._id,
    });

    revalidatePath("/dashboard");
}
