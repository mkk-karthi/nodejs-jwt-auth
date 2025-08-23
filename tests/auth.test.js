const request = require("supertest");
const app = require("../app");
const User = require("../models/user");
const sequelize = require("../services/database");
const RefreshToken = require("../models/refreshToken");
const Otp = require("../models/Otp");

jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn((mailOptions, callback) => {
      callback(null, "Message sent");
    }),
  }),
}));

beforeAll(async () => {
  await User.create({
    name: "test",
    email: "test@gmail.com",
    password: "Test@123",
    status: "1",
  });
});

afterAll(async () => {
  await sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");
  await Otp.truncate();
  await RefreshToken.truncate();
  await User.truncate();
  await sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");
});

describe("login user", () => {
  it("email validation", async () => {
    const res = await request(app).post("/api/login").send({
      email: "test@gmail.c",
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message.includes("email")).toBeTruthy();
  });

  it("password length validation", async () => {
    const res = await request(app).post("/api/login").send({
      email: "test@gmail.com",
      password: "Pass@1",
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message.includes("password")).toBeTruthy();
  });

  it("password invalid", async () => {
    const res = await request(app).post("/api/login").send({
      email: "test@gmail.com",
      password: "Password",
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message.includes("password")).toBeTruthy();
  });

  it("invalid credentials - email", async () => {
    const res = await request(app).post("/api/login").send({
      email: "abc@gmail.com",
      password: "Test@123",
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.message.includes("Invalid credentials")).toBeTruthy();
  });

  it("invalid credentials - password", async () => {
    const res = await request(app).post("/api/login").send({
      email: "test@gmail.com",
      password: "Password@123",
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.message.includes("Invalid credentials")).toBeTruthy();
  });

  it("sucess login", async () => {
    const res = await request(app).post("/api/login").send({
      email: "test@gmail.com",
      password: "Test@123",
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message.includes("Login successfully")).toBeTruthy();
  });

  it("authentication", async () => {
    const res = await request(app).post("/api/login").send({
      email: "test@gmail.com",
      password: "Test@123",
    });
    const accessToken = res.body.data.accessToken;

    expect(res.statusCode).toEqual(200);
    expect(res.body.message.includes("Login successfully")).toBeTruthy();
  });
});

describe("authentication", () => {
  let authToken;
  beforeAll(async () => {
    const res = await request(app).post("/api/login").send({
      email: "test@gmail.com",
      password: "Test@123",
    });

    authToken = res.body.data.accessToken;
  });

  it("without token", async () => {
    const res = await request(app).get("/api/users");

    expect(res.statusCode).toEqual(401);
    expect(res.body.message.includes("Token is required")).toBeTruthy();
  });

  it("invalod token", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer 123`);

    expect(res.statusCode).toEqual(403);
    expect(res.body.message.includes("Invalid access token")).toBeTruthy();
  });

  it("valid token", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length > 0).toBeTruthy();
  });
});

describe("refresh token", () => {
  let accessToken, refreshToken;
  beforeAll(async () => {
    const res = await request(app).post("/api/login").send({
      email: "test@gmail.com",
      password: "Test@123",
    });

    accessToken = res.body.data.accessToken;
    refreshToken = res.body.data.refreshToken;
  });
  it("validation error", async () => {
    const res = await request(app).post("/api/refresh-token").send({
      token: "",
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message.includes("Token is required")).toBeTruthy();
  });

  it("invalid token", async () => {
    const res = await request(app).post("/api/refresh-token").send({
      token: "12345",
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message.includes("Invalid token")).toBeTruthy();
  });

  it("success", async () => {
    const res = await request(app).post("/api/refresh-token").send({
      token: refreshToken,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message.includes("Token generated")).toBeTruthy();
  });

  it("token expired", async () => {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() - 1);
    await RefreshToken.update(
      { expiry: expiry },
      { where: { token: refreshToken } }
    );
    const res = await request(app).post("/api/refresh-token").send({
      token: refreshToken,
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message.includes("Token expired")).toBeTruthy();
  });
});

describe("logout", () => {
  let accessToken, refreshToken;
  beforeAll(async () => {
    const res = await request(app).post("/api/login").send({
      email: "test@gmail.com",
      password: "Test@123",
    });

    accessToken = res.body.data.accessToken;
    refreshToken = res.body.data.refreshToken;
  });

  it("validation error", async () => {
    const res = await request(app)
      .post("/api/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        token: "",
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message.includes("Token is required")).toBeTruthy();
  });

  it("success", async () => {
    const res = await request(app)
      .post("/api/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        token: refreshToken,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message.includes("successfully")).toBeTruthy();
  });
});

describe("change password", () => {
  let accessToken;
  beforeAll(async () => {
    const res = await request(app).post("/api/login").send({
      email: "test@gmail.com",
      password: "Test@123",
    });

    accessToken = res.body.data.accessToken;
  });

  it("validation error - oldPassword", async () => {
    const res = await request(app)
      .post("/api/change-password")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        oldPassword: "Password",
        newPassword: "P@ssw0rd",
        confirmPassword: "P@ssw0rd",
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message.includes("oldPassword")).toBeTruthy();
  });

  it("validation error - newPassword", async () => {
    const res = await request(app)
      .post("/api/change-password")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        oldPassword: "Password@123",
        newPassword: "Password",
        confirmPassword: "P@ssw0rd",
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message.includes("newPassword")).toBeTruthy();
  });

  it("validation error - confirmPassword", async () => {
    const res = await request(app)
      .post("/api/change-password")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        oldPassword: "Password@123",
        newPassword: "P@ssw0rd",
        confirmPassword: "Password",
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message.includes("Confirm Password")).toBeTruthy();
  });

  it("invalid credential", async () => {
    const res = await request(app)
      .post("/api/change-password")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        oldPassword: "Password@123",
        newPassword: "P@ssw0rd",
        confirmPassword: "P@ssw0rd",
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body.message.includes("Invalid credential")).toBeTruthy();
  });

  it("same password", async () => {
    const res = await request(app)
      .post("/api/change-password")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        oldPassword: "P@ssw0rd",
        newPassword: "P@ssw0rd",
        confirmPassword: "P@ssw0rd",
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message.includes("should be different")).toBeTruthy();
  });

  it("success", async () => {
    const res = await request(app)
      .post("/api/change-password")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        oldPassword: "Test@123",
        newPassword: "P@ssw0rd",
        confirmPassword: "P@ssw0rd",
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message.includes("Password changed")).toBeTruthy();
  });
});

describe("forgot password", () => {
  it("validation error", async () => {
    const res = await request(app).post("/api/forgot-password").send({
      email: "test@",
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message.includes("email")).toBeTruthy();
  });

  it("send mail", async () => {
    const res = await request(app).post("/api/forgot-password").send({
      email: "test@gmail.com",
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message.includes("OTP sended")).toBeTruthy();
  });
});

describe("forgot password change", () => {
  it("validation error - email", async () => {
    const res = await request(app).post("/api/forgot-password-change").send({
      email: "test@",
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message.includes("email")).toBeTruthy();
  });

  it("validation error - token", async () => {
    const res = await request(app).post("/api/forgot-password-change").send({
      email: "test@gmail.com",
      token: "",
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message.includes("token")).toBeTruthy();
  });

  it("validation error - token length", async () => {
    const res = await request(app).post("/api/forgot-password-change").send({
      email: "test@gmail.com",
      token: "12",
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message.includes("token")).toBeTruthy();
  });

  it("validation error - token invalid", async () => {
    const res = await request(app).post("/api/forgot-password-change").send({
      email: "test@gmail.com",
      token: "12as",
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message.includes("token")).toBeTruthy();
  });

  it("validation error - password", async () => {
    const res = await request(app).post("/api/forgot-password-change").send({
      email: "test@gmail.com",
      token: "1234",
      password: "P@ssw",
      confirmPassword: "P@ssw0rd",
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message.includes("password")).toBeTruthy();
  });

  it("validation error - confirmPassword", async () => {
    const res = await request(app).post("/api/forgot-password-change").send({
      email: "test@gmail.com",
      token: "1234",
      password: "P@ssw0rd",
      confirmPassword: "Password@123",
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message.includes("Confirm Password")).toBeTruthy();
  });

  it("invalid email", async () => {
    const res = await request(app).post("/api/forgot-password-change").send({
      email: "test1@gmail.com",
      token: "1234",
      password: "P@ssw0rd",
      confirmPassword: "P@ssw0rd",
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message.includes("Invalid token")).toBeTruthy();
  });

  it("invalid token", async () => {
    const res = await request(app).post("/api/forgot-password-change").send({
      email: "test@gmail.com",
      token: "1234",
      password: "P@ssw0rd",
      confirmPassword: "P@ssw0rd",
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message.includes("Invalid token")).toBeTruthy();
  });

  it("Token expired", async () => {
    await request(app).post("/api/forgot-password").send({
      email: "test@gmail.com",
    });

    let otp = await Otp.findOne({
      order: [["id", "DESC"]],
    });
    otp = otp.toJSON();
    let token = otp.token;

    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() - 1);
    await Otp.update({ expiry: expiry }, { where: { token: token } });

    const res = await request(app).post("/api/forgot-password-change").send({
      email: "test@gmail.com",
      token: token,
      password: "P@ssw0rd",
      confirmPassword: "P@ssw0rd",
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message.includes("Token expired")).toBeTruthy();
  });

  it("success", async () => {
    await request(app).post("/api/forgot-password").send({
      email: "test@gmail.com",
    });
    let otp = await Otp.findOne({
      order: [["id", "DESC"]],
    });
    otp = otp.toJSON();
    let token = otp.token;

    const res = await request(app).post("/api/forgot-password-change").send({
      email: "test@gmail.com",
      token: token,
      password: "P@ssw0rd",
      confirmPassword: "P@ssw0rd",
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message.includes("Password changed")).toBeTruthy();
  });
});
