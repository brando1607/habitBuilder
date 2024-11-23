import jwt from "jsonwebtoken";
process.loadEnvFile();
export const TOKEN = process.env.TOKEN;

export function generateToken(payload) {
  const token = jwt.sign(payload, TOKEN, { expiresIn: "1h" });
  return token;
}

export function verifyToken(token) {
  try {
    const decode = jwt.verify(token, TOKEN);
    return decode;
  } catch (error) {
    console.error(error);
  }
}
