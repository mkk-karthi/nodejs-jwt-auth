const config = require("./config");
const crypto = require("crypto");

module.exports = {
  response(res, message = "", data = [], code = 200) {
    res.status(code).json({
      code,
      message,
      ...data,
    });
  },

  secretKey() {
    const key = crypto
      .createHash("sha512")
      .update(process.env.SECRET_KEY)
      .digest("hex")
      .substring(0, 32);
    const iv = crypto
      .createHash("sha512")
      .update(process.env.SECRET_IV)
      .digest("hex")
      .substring(0, 16);

    return { key, iv };
  },

  encrypt(text) {
    try {
      const { key, iv } = this.secretKey();
      let cipher = crypto.createCipheriv(
        process.env.ENCRYPTION_METHOD,
        key,
        iv
      );
      let encrypted = cipher.update(text.toString(), "utf8", "hex");
      encrypted += cipher.final("hex");

      return encrypted;
    } catch (e) {
      console.error("encrypt error:", e);
      return "";
    }
  },

  decrypt(text) {
    try {
      const { key, iv } = this.secretKey();
      let decipher = crypto.createDecipheriv(
        process.env.ENCRYPTION_METHOD,
        key,
        iv
      );
      let decrypted = decipher.update(text.toString(), "hex", "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (e) {
      console.error("decrypt error:", e);
      return "";
    }
  },

  generateOTP(length = 6) {
    const digits = "0123456789";
    let otp = "";
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }
    return otp;
  },
};
