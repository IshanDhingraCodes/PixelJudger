import { signinSchema } from "@/schema/user.validation";
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const parsedData = signinSchema.safeParse(data);

    if (!parsedData.success) {
      return NextResponse.json(
        {
          message: "Incorrect Email or Password",
          success: false,
          error: parsedData.error,
        },
        {
          status: 400,
        }
      );
    }

    const { email, password } = parsedData.data;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "User does not exist",
          success: false,
        },
        {
          status: 401,
        }
      );
    }

    const passwordCompare = await bcrypt.compare(password, user.password);

    if (!passwordCompare) {
      return NextResponse.json(
        {
          message: "Invalid Credentials",
          success: false,
        },
        {
          status: 401,
        }
      );
    }

    const sessionToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json(
      {
        message: "Login Succesfull",
        success: true,
      },
      {
        status: 200,
      }
    );

    response.cookies.set({
      name: "authToken",
      value: sessionToken,
      maxAge: 7 * 24 * 60 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error,
      },
      {
        status: 500,
      }
    );
  }
}
