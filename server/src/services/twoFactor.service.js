import speakeasy from "speakeasy";
import QRCode    from "qrcode";

export const generate2FASecret = (email) =>
  speakeasy.generateSecret({ name: `Stakepedia Admin (${email})`, issuer: "Stakepedia", length: 32 });

export const generateQRCode = (otpauthUrl) => QRCode.toDataURL(otpauthUrl);

export const verify2FAToken = (secret, token) =>
  speakeasy.totp.verify({ secret, encoding: "base32", token, window: 2 });