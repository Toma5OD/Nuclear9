import jwt from "jsonwebtoken";
import { db } from "../models/db.js";
import dotenv from "dotenv";

const result = dotenv.config();

export function createToken(user) {
  const payload = {
    id: user._id,
    email: user.email
  };
  const options = {
    algorithm: "HS256",
    expiresIn: "1h"
  };
  return jwt.sign(payload, process.env.cookie_password, options);
}

export function decodeToken(token) {
  var userInfo = {};
  try {
    var decoded = jwt.verify(token, process.env.cookie_password);
    userInfo.userId = decoded.id;
    userInfo.email = decoded.email;
  } catch (e) {
    console.log(e.message);
  }
  return userInfo;
}

export async function validate(decoded, request) {
  const user = await db.userStore.getUserById(decoded.id);
  if (!user) {
    return { isValid: false };
  } else {
    return { isValid: true, credentials: user };
  }
}
