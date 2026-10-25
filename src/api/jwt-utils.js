import { decodeTokenWith, signUserToken, userIdFromAuthHeader } from "./jwt-core.js";
import { db } from "../models/db.js";
import dotenv from "dotenv";

const result = dotenv.config();

export function createToken(user) {
  return signUserToken(user, process.env.cookie_password);
}

export function decodeToken(token) {
  return decodeTokenWith(token, process.env.cookie_password);
}

export async function validate(decoded, request) {
  const user = await db.userStore.getUserById(decoded.id);
  if (!user) {
    return { isValid: false };
  } else {
    return { isValid: true, credentials: user };
  }
}
