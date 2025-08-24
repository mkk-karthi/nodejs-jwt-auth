const request = require("supertest");
const fs = require("fs");
const path = require("path");
const app = require("../app");
const sequelize = require("../services/database");
const User = require("../models/user");
const helpers = require("../helpers");
const Otp = require("../models/Otp");
const RefreshToken = require("../models/refreshToken");
const config = require("../config");

let authToken, id;
beforeAll(async () => {
  let user = await User.create({
    name: "auth",
    email: "auth@gmail.com",
    password: "Auth@123",
    status: "1",
  });
  user = user.toJSON();
  id = user.id;

  const res = await request(app).post("/api/login").send({
    email: "auth@gmail.com",
    password: "Auth@123",
  });

  authToken = res.body.data.accessToken;
});

afterAll(async () => {
  await sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");
  await Otp.truncate();
  await RefreshToken.truncate();
  await User.truncate();
  await sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");
});

describe("create user", () => {
  it("name validation", async () => {
    const res = await request(app)
      .post("/api/user")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "it",
        email: "test@gmail.com",
        dob: "2020-01-01",
        password: "Test@123",
        status: "1",
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message.includes("name")).toBeTruthy();
  });

  it("email validation", async () => {
    const res = await request(app)
      .post("/api/user")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "test",
        email: 123,
        dob: "2020-01-01",
        password: "Test@123",
        status: "1",
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message.includes("email")).toBeTruthy();
  });

  it("email validation: invalid mail", async () => {
    const res = await request(app)
      .post("/api/user")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "test",
        email: "test@gmail.c",
        dob: "2020-01-01",
        password: "Test@123",
        status: "1",
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message.includes("email")).toBeTruthy();
  });

  it("dob validation: invalid date", async () => {
    const res = await request(app)
      .post("/api/user")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "test",
        email: "test@gmail.com",
        dob: "2020",
        password: "Test@123",
        status: "1",
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message.includes("dob")).toBeTruthy();
  });

  it("dob validation: min date", async () => {
    const res = await request(app)
      .post("/api/user")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "test",
        email: "test@gmail.com",
        dob: "1960-01-01",
        password: "Test@123",
        status: "1",
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message.includes("dob")).toBeTruthy();
  });

  it("status validation", async () => {
    const res = await request(app)
      .post("/api/user")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "test",
        email: "test@gmail.com",
        dob: "2000-01-01",
        password: "Test@123",
        status: "3",
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message.includes("status")).toBeTruthy();
  });

  it("password validation", async () => {
    const res = await request(app)
      .post("/api/user")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "test",
        email: "test@gmail.com",
        dob: "2000-01-01",
        password: "Test",
        status: "1",
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message.includes("password")).toBeTruthy();
  });

  it("create sucessfull", async () => {
    const res = await request(app)
      .post("/api/user")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "test",
        email: "tests@gmail.com",
        dob: "2001-03-01",
        password: "Test@123",
        status: "1",
      });

    expect(res.statusCode).toEqual(200);
  });

  it("duplicate mail", async () => {
    const res = await request(app)
      .post("/api/user")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "test",
        email: "tests@gmail.com",
        dob: "2000-01-01",
        password: "Test@123",
        status: "1",
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message.includes("email")).toBeTruthy();
  });
});

describe("get user", () => {
  let id;
  beforeAll(async () => {
    let user = await User.create({
      name: "test2",
      email: "test2@gmail.com",
      dob: "2001-03-01",
      password: "Test@123",
      status: "1",
    });
    user = user.toJSON();
    id = helpers.encrypt(user.id);
  });

  it("get user invalid id", async () => {
    const res = await request(app)
      .get(`/api/user/1234`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body.message.includes("User not found")).toBeTruthy();
  });

  it("get user successfull", async () => {
    const res = await request(app)
      .get(`/api/user/${id}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(200);
    expect(Object.keys(res.body.data).length > 0).toBeTruthy();
  });
});

describe("update user", () => {
  let id;
  beforeAll(async () => {
    let user = await User.create({
      name: "test3",
      email: "test3@gmail.com",
      dob: "2001-03-01",
      password: "Test@123",
      status: "1",
    });
    id = helpers.encrypt(user.id);
  });

  it("update user by invalid id", async () => {
    const res = await request(app)
      .put(`/api/user/1234`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "test4",
        email: "test4@gmail.com",
        dob: "2001-05-05",
        status: "2",
      });

    expect(res.statusCode).toEqual(404);
    expect(res.body.message.includes("User not updated")).toBeTruthy();
  });

  it("validation error", async () => {
    const res = await request(app)
      .put(`/api/user/${id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "test4",
        email: "test4@gmail.com",
        dob: "1960-01-01",
        status: "2",
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message.includes("dob")).toBeTruthy();
  });

  it("empty update", async () => {
    const res = await request(app)
      .put(`/api/user/${id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({});

    expect(res.statusCode).toEqual(400);
    expect(
      res.body.message.includes("must contain at least one of")
    ).toBeTruthy();
  });

  it("update user", async () => {
    const res = await request(app)
      .put(`/api/user/${id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "test4",
        email: "test4@gmail.com",
        dob: "2001-05-05",
        status: "2",
      });

    let user = await User.findByPk(helpers.decrypt(id));

    expect(res.statusCode).toEqual(200);
    expect(user.name).toBe("test4");
    expect(user.email).toBe("test4@gmail.com");
    expect(user.dob).toBe("2001-05-05");
    expect(user.status).toBe("2");
  });

  it("duplicate mail", async () => {
    await User.create({
      name: "test5",
      email: "test5@gmail.com",
      dob: "2001-03-01",
      password: "Test@123",
      status: "1",
    });

    const res = await request(app)
      .put(`/api/user/${id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "test5",
        email: "test5@gmail.com",
        dob: "2000-01-01",
        status: "1",
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message.includes("email")).toBeTruthy();
  });
});

describe("delete user", () => {
  let id;
  beforeAll(async () => {
    let user = await User.create({
      name: "test6",
      email: "test6@gmail.com",
      dob: "2001-03-01",
      password: "Test@123",
      status: "1",
    });
    id = helpers.encrypt(user.id);
  });

  it("delete user by invalid id", async () => {
    const res = await request(app)
      .delete(`/api/user/1234`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "test2",
        email: "test2@gmail.com",
        dob: "2001-05-05",
        status: "2",
      });

    expect(res.statusCode).toEqual(404);
    expect(res.body.message.includes("User not deleted")).toBeTruthy();
  });

  it("delete user", async () => {
    const res = await request(app)
      .delete(`/api/user/${id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "test2",
        email: "test2@gmail.com",
        dob: "2001-05-05",
        status: "2",
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message.includes("User deleted")).toBeTruthy();
  });
});

describe("list user", () => {
  it("users found", async () => {
    await User.create({
      name: "test1",
      email: "test1@gmail.com",
      dob: "2001-03-01",
      password: "Test@123",
      status: "1",
    });
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length > 0).toBeTruthy();
  });

  it("users not found", async () => {
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");
    await RefreshToken.truncate();
    await User.truncate();
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");

    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(404);
  });
});

describe("upload file - create", () => {
  let validImg, invalidImg, largeImg;
  beforeAll(async () => {
    validImg = path.join(__dirname, "files/avatar.png");
    invalidImg = path.join(__dirname, "files/lipsum.pdf");
    largeImg = path.join(__dirname, "files/high.jpg");
    if (!fs.existsSync(validImg)) {
      validImg = null;
    }
    if (!fs.existsSync(invalidImg)) {
      invalidImg = null;
    }
    if (!fs.existsSync(largeImg)) {
      largeImg = null;
    }
  });

  it("invalid image", async () => {
    const res = await request(app)
      .post("/api/user")
      .set("Authorization", `Bearer ${authToken}`)
      .attach("avatar", invalidImg)
      .field("name", "test")
      .field("email", "upload@gmail.com")
      .field("dob", "2000-01-01")
      .field("password", "Test@123")
      .field("status", "1");

    expect(res.statusCode).toEqual(400);
    expect(
      res.body.message.includes("File must be an image (jpg, jpeg, png)")
    ).toBeTruthy();
  });

  it("large image", async () => {
    const res = await request(app)
      .post("/api/user")
      .set("Authorization", `Bearer ${authToken}`)
      .attach("avatar", largeImg)
      .field("name", "test")
      .field("email", "upload@gmail.com")
      .field("dob", "2000-01-01")
      .field("password", "Test@123")
      .field("status", "1");

    expect(res.statusCode).toEqual(400);
    expect(
      res.body.message.includes("File size must be less than 10MB")
    ).toBeTruthy();
  });

  it("valid image", async () => {
    const res = await request(app)
      .post("/api/user")
      .set("Authorization", `Bearer ${authToken}`)
      .attach("avatar", validImg)
      .field("name", "test")
      .field("email", "upload@gmail.com")
      .field("dob", "2000-01-01")
      .field("password", "Test@123")
      .field("status", "1");

    expect(res.statusCode).toEqual(200);
  });
});

describe("upload file - update", () => {
  let validImg, invalidImg, largeImg, encryptId;
  beforeAll(async () => {
    validImg = path.join(__dirname, "files/avatar.png");
    invalidImg = path.join(__dirname, "files/lipsum.pdf");
    largeImg = path.join(__dirname, "files/high.jpg");
    if (!fs.existsSync(validImg)) {
      validImg = null;
    }
    if (!fs.existsSync(invalidImg)) {
      invalidImg = null;
    }
    if (!fs.existsSync(largeImg)) {
      largeImg = null;
    }
    encryptId = helpers.encrypt(id);
  });

  it("invalid image", async () => {
    const res = await request(app)
      .put(`/api/user/${encryptId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .attach("avatar", invalidImg);

    expect(res.statusCode).toEqual(400);
    expect(
      res.body.message.includes("File must be an image (jpg, jpeg, png)")
    ).toBeTruthy();
  });

  it("large image", async () => {
    const res = await request(app)
      .put(`/api/user/${encryptId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .attach("avatar", largeImg);

    expect(res.statusCode).toEqual(400);
    expect(
      res.body.message.includes("File size must be less than 10MB")
    ).toBeTruthy();
  });

  it("valid image", async () => {
    const res = await request(app)
      .put(`/api/user/${encryptId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .attach("avatar", validImg);

    let user = await User.findByPk(id);
    user = user.toJSON();

    expect(res.statusCode).toEqual(200);
    expect(
      fs.existsSync(config.appPath + "/storage/" + user.avatar)
    ).toBeTruthy();
  });

  it("old image deleted", async () => {
    let user = await User.findByPk(id);
    user = user.toJSON();
    let oldImg = config.appPath + "/storage/" + user.avatar;
    expect(fs.existsSync(oldImg)).toBeTruthy();

    const res = await request(app)
      .put(`/api/user/${encryptId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .attach("avatar", validImg);

    user = await User.findByPk(id);
    user = user.toJSON();

    expect(res.statusCode).toEqual(200);
    expect(
      fs.existsSync(config.appPath + "/storage/" + user.avatar)
    ).toBeTruthy();
    expect(fs.existsSync(oldImg)).toBeFalsy();
  });
});
