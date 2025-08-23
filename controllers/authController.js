const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");

const helpers = require("../helpers");
const User = require("../models/user");
const RefreshToken = require("../models/refreshToken");
const logger = require("../services/logger");
const config = require("../config");
const Otp = require("../models/otp");
const transporter = require("../services/mail");

const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};
const generateRefreshToken = async (user) => {
  const token = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7);

  await RefreshToken.create({
    token,
    userId: user.id,
    expiry: expiryDate,
  });
  return token;
};

module.exports = {
  async login(req, res) {
    try {
      // Validate the input
      const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string()
          .pattern(new RegExp(config.passwordPattern))
          .required()
          .messages({
            "string.pattern.base": "{#label} is invalid",
          }),
      })
        .unknown()
        .required();

      const { value, error } = schema.validate({ ...req.body });

      // validation error
      if (error) {
        helpers.response(res, error.details[0].message, {}, 400);
      } else {
        // check email address
        let user = await User.findOne({
          where: { email: value.email },
          attributes: [
            "id",
            "name",
            "email",
            "password",
            "dob",
            "avatar",
            "status",
          ],
        });
        if (!user) {
          return helpers.response(res, "Invalid credentials", {}, 401);
        }
        user = user.toJSON();

        // verify password
        const verify = await bcrypt.compare(value.password, user.password);
        if (!verify) {
          return helpers.response(res, "Invalid credentials", {}, 401);
        }

        // generate access and refresh Token
        delete user["password"];
        const accessToken = await generateAccessToken(user);
        const refreshToken = await generateRefreshToken(user);

        helpers.response(res, "Login successfully", {
          data: {
            accessToken,
            refreshToken,
          },
        });
      }
    } catch (err) {
      logger.error("Login error:", err);
      helpers.response(res, "Internal server error", {}, 500);
    }
  },

  async refreshToken(req, res) {
    try {
      const { token } = req.body;
      if (!token) {
        return helpers.response(res, "Token is required", {}, 401);
      }

      // fecth token data by token
      const refreshToken = await RefreshToken.findOne({ where: { token } });
      if (!refreshToken) {
        return helpers.response(res, "Invalid token", {}, 400);
      }

      // check token expiry
      if (refreshToken.expiry.getTime() < new Date().getTime()) {
        await refreshToken.destroy();
        return helpers.response(res, "Invalid token", {}, 400);
      }

      // verify the token
      jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
        let userData = await User.findByPk(user.id);

        if (err) {
          await refreshToken.destroy();
          return helpers.response(res, "Token expired", {}, 400);
        }

        // generate access token
        const accessToken = generateAccessToken(userData.toJSON());

        helpers.response(res, "Token generated", {
          data: {
            accessToken,
            refreshToken: token,
          },
        });
      });
    } catch (err) {
      logger.error("refreshToken error:", err);
      helpers.response(res, "Internal server error", {}, 500);
    }
  },

  async logout(req, res) {
    try {
      const { token } = req.body;
      if (!token) {
        return helpers.response(res, "Refresh token is required", {}, 401);
      }

      // delete the token in db
      await RefreshToken.destroy({ where: { token } });
      helpers.response(res, "Logged out successfully");
    } catch (err) {
      logger.error("logout error:", err);
      helpers.response(res, "Internal server error", {}, 500);
    }
  },

  async changePassword(req, res) {
    try {
      // Validate the input
      const schema = Joi.object({
        oldPassword: Joi.string()
          .pattern(new RegExp(config.passwordPattern))
          .required()
          .messages({
            "string.pattern.base": "{#label} is invalid",
          }),
        newPassword: Joi.string()
          .pattern(new RegExp(config.passwordPattern))
          .required()
          .messages({
            "string.pattern.base": "{#label} is invalid",
          }),
        confirmPassword: Joi.string()
          .valid(Joi.ref("newPassword"))
          .required()
          .label("Confirm Password")
          .messages({
            "any.only": "{#label} must match Password",
          }),
      })
        .unknown()
        .required();

      const { value, error } = schema.validate({ ...req.body });
      // validation error
      if (error) {
        helpers.response(res, error.details[0].message, {}, 400);
      } else {
        if (value.oldPassword == value.newPassword) {
          return helpers.response(
            res,
            "password and old password should be different",
            {},
            400
          );
        }
        let user = await User.findOne({
          where: { id: req.user.id },
          attributes: ["id", "name", "email", "password"],
        });

        // verify old password
        const verify = await bcrypt.compare(value.oldPassword, user.password);
        if (!verify) {
          return helpers.response(res, "Invalid credential", {}, 401);
        }

        // password update
        await user.update({ password: value.newPassword });
        helpers.response(res, "Password changed");
      }
    } catch (err) {
      logger.error("changePassword error:", err);
      helpers.response(res, "Internal server error", {}, 500);
    }
  },

  async forgotPassword(req, res) {
    try {
      // Validate the input
      const schema = Joi.object({
        email: Joi.string().email().required(),
      })
        .unknown()
        .required();

      const { value, error } = schema.validate({ ...req.body });

      // validation error
      if (error) {
        helpers.response(res, error.details[0].message, {}, 400);
      } else {
        // check email address
        let user = await User.findOne({
          where: { email: value.email },
        });
        if (user) {
          // generate otp
          let otp = helpers.generateOTP();
          const expiry = new Date();
          expiry.setMinutes(expiry.getMinutes() + 5);

          // remove old datas
          await Otp.destroy({ where: { userId: user.id } });

          // store otp in database
          await Otp.create({
            token: otp,
            userId: user.id,
            expiry,
          });

          // generate mail content
          let mailData = `<h2>Forgot your password?</h2>`;
          mailData += `<p>Your OTP is: ${otp}</p>`;
          mailData += `<p>If you didn't request a password reset, please ignore this email.</p>`;

          var mailMessage = {
            from: process.env.MAIL_FROM_ADDRESS,
            to: value.email,
            subject: `Reset Password - ${config.appName}`,
            html: mailData,
          };

          // Send email
          transporter.sendMail(mailMessage, (err, info) => {
            if (err) {
              logger.error("mail error:", err);
              return helpers.response(res, "Mail not sending", {}, 500);
            }

            return helpers.response(res, "OTP sended");
          });
        } else {
          helpers.response(res, "OTP sended");
        }
      }
    } catch (err) {
      logger.error("forgotPassword error:", err);
      helpers.response(res, "Internal server error", {}, 500);
    }
  },

  async forgotPasswordChange(req, res) {
    try {
      // Validate the input
      const schema = Joi.object({
        email: Joi.string().email().required(),
        token: Joi.string().min(4).max(8).pattern(/^\d+$/).required().messages({
          "string.pattern.base": "{#label} must be a number",
        }),
        password: Joi.string()
          .pattern(new RegExp(config.passwordPattern))
          .required()
          .messages({
            "string.pattern.base": "{#label} is invalid",
          }),
        confirmPassword: Joi.string()
          .valid(Joi.ref("password"))
          .required()
          .label("Confirm Password")
          .messages({
            "any.only": "{#label} must match Password",
          }),
      })
        .unknown()
        .required();

      const { value, error } = schema.validate({ ...req.body });

      // validation error
      if (error) {
        helpers.response(res, error.details[0].message, {}, 400);
      } else {
        // check valid token
        let token = await Otp.findOne({
          include: [
            {
              model: User,
              as: "user",
              where: {
                email: value.email,
              },
              separate: false,
            },
          ],
          where: {
            token: value.token,
          },
        });

        if (!token) {
          return helpers.response(res, "Invalid token", {}, 400);
        } else if (token.expiry.getTime() < new Date().getTime()) {
          // check token expiry
          await token.destroy();
          return helpers.response(res, "Token expired", {}, 400);
        }

        // password update
        await User.update(
          { password: value.password },
          {
            where: {
              id: token.user.id,
            },
          }
        );
        await token.destroy();
        helpers.response(res, "Password changed");
      }
    } catch (err) {
      logger.error("forgotPasswordChange error:", err);
      helpers.response(res, "Internal server error", {}, 500);
    }
  },
};
