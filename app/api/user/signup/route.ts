import prisma from "@/lib/prisma";
import { signUpSchema } from "@/schema/user.validation";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const parsedData = signUpSchema.safeParse(data);

    if (!parsedData.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Input",
          error: parsedData.error,
        },
        {
          status: 400,
        }
      );
    }

    const { name, email, password } = parsedData.data;

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "User Already Exist",
          success: false,
        },
        {
          status: 409,
        }
      );
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      {
        message: "User Created Successfully",
        user,
        success: true,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Something went wrong",
        success: false,
        error,
      },
      {
        status: 500,
      }
    );
  }
}
