import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await auth();

    if (!session || !session.user) {
        redirect("/login");
    }

    if (session.user.role === "TEACHER") {
        redirect("/teacher/dashboard");
    } else if (session.user.role === "STUDENT") {
        redirect("/student/dashboard");
    }

    // Default fallback
    redirect("/login");
}
