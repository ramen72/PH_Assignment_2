import type { Request, Response } from "express";
import sendResponse from "../../utility/sendResponse";
import { authService } from "./auth.service";

// Create user
const signupUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.userRegisterIntoDB(req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User create successfully.",
      data: result.rows[0],
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      // message: error.code === "23505" ? "Email already exists." : "User created successfully.",
      message: error.message,
      error,
    });
  }
};

export const authController = {
  signupUser,
};
