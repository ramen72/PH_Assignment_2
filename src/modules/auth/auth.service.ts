import bcrypt from "bcryptjs";
import { pool } from "../../db";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { config } from "../../config";
import type { IUser } from "./auth.interface";
import { USER_ROLE } from "../../types";

const userRegisterIntoDB = async (payload: IUser) => {
  const { name, email, password, role } = payload;
  const hashPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `
    INSERT INTO users (name,
      email,
      password,
      role) VALUES ($1,$2,$3,COALESCE($4, 'contributor')) RETURNING *
    `,
    [name, email, hashPassword, role],
  );
  delete result.rows[0].password;
  return result;
};

// const loginUserIntoDB = async (payload: {
//   email: string;
//   password: string;
// }) => {
//   const { email, password } = payload;
//   // * check if the user exist
//   // * Compare the password
//   // * Generate Token
//   const userData = await pool.query(
//     `
//       SELECT * FROM users WHERE email = $1
//       `,
//     [email],
//   );

//   if (userData.rows.length === 0) {
//     throw new Error("User Not Found!");
//   }
//   const user = userData.rows[0];
//   const matchPassword = await bcrypt.compare(password, user.password);
//   if (!matchPassword) {
//     throw new Error("Invalid Credentials!");
//   }

//   // * Generate Token
//   const jwtPayload = {
//     id: user.id,
//     name: user.name,
//     email: user.email,
//     role: user.role,
//     isActive: user.is_active,
//   };

//   const accessToken = jwt.sign(jwtPayload, config.secret as string, {
//     expiresIn: "15m",
//   });

//   const refreshToken = jwt.sign(jwtPayload, config.refresh_secret as string, {
//     expiresIn: "7d",
//   });

//   return {
//     accessToken,
//     refreshToken,
//   };
// };
// const generateRefreshToken = async (token: string) => {
//   console.log(token);
//   if (!token) {
//     throw new Error("Unauthorized. No token provided.");
//   }

//   // * Token Decode and Verify Logic Here
//   const decodedToken = jwt.verify(
//     token as string,
//     config.refresh_secret as string,
//   ) as JwtPayload;

//   const userData = await pool.query("SELECT * FROM users WHERE email = $1", [
//     decodedToken.email,
//   ]);

//   const user = userData.rows[0];
//   console.log(user);

//   if (userData.rows.length === 0) {
//     throw new Error("User Not Found!");
//   }

//   if (!user?.isactive) {
//     throw new Error("Forbidden. User is not active.");
//   }

//   // * Generate Token
//   const jwtPayload = {
//     id: user.id,
//     name: user.name,
//     email: user.email,
//     role: user.role,
//     isActive: user.is_active,
//   };

//   const accessToken = jwt.sign(jwtPayload, config.secret as string, {
//     expiresIn: "15m",
//   });
//   return { accessToken };
// };

export const authService = {
  userRegisterIntoDB,
  //   loginUserIntoDB,
  //   generateRefreshToken,
};
