import crypto from "crypto";

export const generateToken   = () => crypto.randomBytes(32).toString("hex");
export const hashToken       = (token) => crypto.createHash("sha256").update(token).digest("hex");
export const generateNumericOtp = (length = 6) => {
	const min = 10 ** (length - 1);
	const max = (10 ** length) - 1;
	return String(crypto.randomInt(min, max + 1));
};