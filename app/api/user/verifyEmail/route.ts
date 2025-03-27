import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        {
          message: "Wrong Token",
          success: false,
        },
        {
          status: 400,
        }
      );
    }

    const verifyEmail = await prisma.verifyEmailToken.findFirst({
      where: {
        token,
      },
    });

    if (!verifyEmail) {
      return NextResponse.json(
        {
          message: "User Not Found",
          success: false,
        },
        {
          status: 404,
        }
      );
    }

    if (verifyEmail && verifyEmail.expireAt > Date.now()) {
      await prisma.user.update({
        where: {
          email: verifyEmail.email,
        },
        data: {
          isVerified: true,
        },
      });

      await prisma.verifyEmailToken.delete({
        where: {
          id: verifyEmail.id,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "User Verified successfully.",
      },
      {
        status: 202,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Server error",
        success: false,
        error,
      },
      { status: 401 }
    );
  }
}
