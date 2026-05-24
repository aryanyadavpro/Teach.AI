import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Enrollment from "@/models/Enrollment";

// DEV ONLY: Delete all enrollments with string-based studentIds
export async function DELETE(req: Request) {
    try {
        await connectDB();

        // Delete enrollments where studentId is stored as string (incorrect type)
        const result = await Enrollment.deleteMany({
            studentId: { $type: "string" }
        });

        console.log(`Deleted ${result.deletedCount} string-based enrollments`);

        return NextResponse.json({
            success: true,
            message: `Deleted ${result.deletedCount} old enrollments with incorrect ID type`,
            deletedCount: result.deletedCount
        });

    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json(
            { error: 'Failed to delete enrollments', details: (error as Error).message },
            { status: 500 }
        );
    }
}
