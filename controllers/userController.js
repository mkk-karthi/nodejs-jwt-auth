const Joi = require("joi").extend(require("@joi/date"));
const sequelize = require("sequelize");
const Path = require("path");
const fs = require("fs");

const User = require("../models/user");
const helpers = require("../helpers");
const logger = require("../services/logger");
const config = require("../config");

module.exports = {
  async list(req, res) {
    try {
      // get users from table
      let users = await User.findAll();

      if (users && users.length > 0) {
        // collect the data
        users = users.map((row) => {
          row = row.toJSON();
          return {
            ...row,
            id: helpers.encrypt(row.id),
          };
        });

        helpers.response(res, "User found", { data: users });
      } else {
        helpers.response(res, "User not found", {}, 404);
      }
    } catch (e) {
      logger.error("user list error:", e);
      helpers.response(res, "Internal server error", {}, 500);
    }
  },

  async create(req, res) {
    var path, uploadPath;
    let isError = false;
    try {
      // Validate the input
      const schema = Joi.object({
        name: Joi.string().min(3).max(30).required(),
        email: Joi.string().email().required(),
        status: Joi.number().valid(1, 2).empty("").default(1),
        dob: Joi.date()
          .format("YYYY-MM-DD")
          .min("1970-01-01")
          .max("2020-12-30")
          .empty(""),
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

        avatar: Joi.object({
          originalname: Joi.string()
            .required()
            .pattern(/\.(jpg|jpeg|png|gif)$/i)
            .message(
              "File must be an image (jpg, jpeg, png, gif) or document (pdf, doc, docx)"
            ),
          mimetype: Joi.string()
            .required()
            .valid("image/jpeg", "image/png", "image/gif")
            .messages({
              "any.only": "Invalid file type",
            }),
          size: Joi.number()
            .max(config.maxFileSize * 1024 * 1024) // 10MB max
            .required()
            .messages({
              "number.max": "File size must be less than 10MB",
            }),
        })
          .unknown()
          .empty(""),
      })
        .unknown()
        .required();

      const { value, error } = schema.validate({
        avatar: req.file,
        ...req.body,
      });
      var { filename, path } = req.file ?? {};

      // validation error
      if (error) {
        isError = true;
        helpers.response(res, error.details[0].message, {}, 400);
      } else {
        // chech email is already exist
        let checkMail = await User.findOne({ where: { email: value.email } });

        if (checkMail) {
          isError = true;
          helpers.response(res, "email already exist", {}, 400);
        } else {
          // move file from temp to upload path
          if (path && fs.existsSync(path)) {
            uploadPath = Path.join(config.fileDir.upload, filename);
            fs.renameSync(path, Path.join("storage", uploadPath));
          }

          // insert user
          let user = await User.create({
            name: value.name,
            email: value.email,
            password: value.password,
            dob: value.dob,
            avatar: uploadPath,
            status: value.status,
          });

          if (user) {
            helpers.response(res, "User created");
          } else {
            helpers.response(res, "User not created");
          }
        }
      }
    } catch (e) {
      isError = true;

      // remove the uploaded file
      if (uploadPath && fs.existsSync(uploadPath)) {
        fs.unlinkSync(uploadPath);
      }

      logger.error("user create error:", e);
      helpers.response(res, "Internal server error", {}, 500);
    }

    // when error to remove the temp file
    if (isError && path && fs.existsSync(path)) {
      fs.unlinkSync(path);
    }
  },

  async view(req, res) {
    try {
      // get and decrypt the id
      let id = helpers.decrypt(req.params.id);

      // get user from table
      let user = await User.findOne({
        where: { id: id },
      });

      if (user) {
        // collect the data
        user = user.toJSON();
        user.id = helpers.encrypt(user.id);

        helpers.response(res, "User found", { data: user });
      } else {
        helpers.response(res, "User not found", {}, 404);
      }
    } catch (e) {
      logger.error("user view error:", e);
      helpers.response(res, "Internal server error", {}, 500);
    }
  },

  async update(req, res) {
    var path, oldPath, uploadPath;
    let isError = false;
    try {
      // Validate the input
      const schema = Joi.object({
        name: Joi.string().min(3).max(30).empty(""),
        email: Joi.string().email().empty(""),
        status: Joi.number().valid(1, 2).empty(""),
        dob: Joi.date()
          .format("YYYY-MM-DD")
          .min("1970-01-01")
          .max("2020-12-30")
          .empty(""),

        avatar: Joi.object({
          originalname: Joi.string()
            .required()
            .pattern(/\.(jpg|jpeg|png|gif)$/i)
            .message(
              "File must be an image (jpg, jpeg, png, gif) or document (pdf, doc, docx)"
            ),
          mimetype: Joi.string()
            .required()
            .valid("image/jpeg", "image/png", "image/gif")
            .messages({
              "any.only": "Invalid file type",
            }),
          size: Joi.number()
            .max(config.maxFileSize * 1024 * 1024) // 10MB max
            .required()
            .messages({
              "number.max": "File size must be less than 10MB",
            }),
        })
          .unknown()
          .empty(""),
      })
        .or("name", "email", "status", "dob")
        .unknown()
        .required();

      const { value, error } = schema.validate({
        avatar: req.file,
        ...req.body,
      });
      var { filename, path } = req.file ?? {};

      // validation error
      if (error) {
        isError = true;
        helpers.response(res, error.details[0].message, {}, 400);
      } else {
        // get and decrypt the id
        let id = helpers.decrypt(req.params.id);

        // chech email is already exist
        if (value.email) {
          let checkMail = await User.findOne({
            where: { email: value.email, id: { [sequelize.Op.ne]: id } },
          });
          if (checkMail) {
            isError = true;
            helpers.response(res, "email already exist", {}, 400);
          }
        }

        if (!isError) {
          // get old file path
          let user = await User.findByPk(id);
          oldPath = user?.avatar;
          oldPath = oldPath ? Path.join("storage", oldPath) : "";

          // move file from temp to upload path
          if (path && fs.existsSync(path)) {
            uploadPath = Path.join(config.fileDir.upload, filename);
            fs.renameSync(path, Path.join("storage", uploadPath));
          }

          let input = {
            name: value.name,
            email: value.email,
          };
          if (value.dob) input["dob"] = value.dob;
          if (value.status) input["status"] = value.status;
          if (uploadPath) input["avatar"] = uploadPath;

          // update user
          let updated = await User.update(input, { where: { id } });

          if (updated[0] == 1) {
            // remove old path
            if (oldPath && uploadPath && fs.existsSync(oldPath)) {
              fs.unlinkSync(oldPath);
            }
            helpers.response(res, "User updated");
          } else {
            helpers.response(res, "User not updated", {}, 404);
          }
        }
      }
    } catch (e) {
      isError = true;

      // remove the uploaded file
      if (uploadPath && fs.existsSync(uploadPath)) {
        fs.unlinkSync(uploadPath);
      }

      logger.error("user update error:", e);
      helpers.response(res, "Internal server error", {}, 500);
    }

    // when error remove the temp file
    if (isError && path && fs.existsSync(path)) {
      fs.unlinkSync(path);
    }
  },

  async delete(req, res) {
    try {
      // get and decrypt the id
      let id = helpers.decrypt(req.params.id);

      // get user
      let user = await User.findByPk(id);
      let avatarPath = user?.avatar;
      avatarPath = avatarPath ? Path.join("storage", avatarPath) : "";

      // delete user
      let deleted = await User.destroy({ where: { id } });

      if (deleted) {
        // remove file
        if (avatarPath && fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath);
        }

        helpers.response(res, "User deleted");
      } else {
        helpers.response(res, "User not deleted", {}, 404);
      }
    } catch (e) {
      logger.error("user update error:", e);
      helpers.response(res, "Internal server error", {}, 500);
    }
  },
};
