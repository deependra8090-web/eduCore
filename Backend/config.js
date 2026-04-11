import dotenv from "dotenv";

dotenv.config();

const config = {
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "sk_test_default",
  JWT_USER_PASSWORD: process.env.JWT_USER_PASSWORD || "user_secret_key",
  JWT_ADMIN_PASSWORD: process.env.JWT_ADMIN_PASSWORD || "admin_secret_key",
};

export default config;
