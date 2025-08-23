const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authController = require("../controllers/authController");

// auth model
router.post("/login", authController.login);
router.post("/logout", authMiddleware, authController.logout);
router.post("/refresh-token", authController.refreshToken);
router.post("/change-password", authMiddleware, authController.changePassword);
router.post("/forgot-password", authController.forgotPassword);
router.post("/forgot-password-change", authController.forgotPasswordChange);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User aauth management api
 * /api/login:
 *   post:
 *     summary: Login the user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             example:
 *               email: john.doe@example.com
 *               password: Password@123
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *             example:
 *               code: 200
 *               message: Login sucessfully
 *               data:
 *                 accessToken: UGrhXaTix22QBX5e5UcPNbMYDCyeGnr8o7Ms9U6EkmA
 *                 refreshToken: UGrhXaTix22QBX5e5UcPNbMYDCyeGnr8o7Ms9U6EkmA
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 * /api/logout:
 *   post:
 *     summary: Logout the user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: refresh token
 *             example:
 *               token: UGrhXaTix22QBX5e5UcPNbMYDCyeGnr8o7Ms9U6EkmA
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *             example:
 *               code: 200
 *               message: Token generated
 *       400:
 *         description: Validation error
 *       403:
 *         description: Invalid access token
 * /api/refresh-token:
 *   post:
 *     summary: refresh the user access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: refresh token
 *             example:
 *               token: UGrhXaTix22QBX5e5UcPNbMYDCyeGnr8o7Ms9U6EkmA
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *             example:
 *               code: 200
 *               message: Token generated
 *               data:
 *                 accessToken: UGrhXaTix22QBX5e5UcPNbMYDCyeGnr8o7Ms9U6EkmA
 *                 refreshToken: UGrhXaTix22QBX5e5UcPNbMYDCyeGnr8o7Ms9U6EkmA
 *       400:
 *         description: Validation error
 * /api/change-password:
 *   post:
 *     summary: Change the user password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *             example:
 *               oldPassword: Password@123
 *               newPassword: newPassword@123
 *               confirmPassword: newPassword@123
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *             example:
 *               code: 200
 *               message: Password changed
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Invalid access token
 * /api/forgot-password:
 *   post:
 *     summary: forgot the password to send otp mail
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *             example:
 *               email: john.doe@example.com
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *             example:
 *               code: 200
 *               message: Otp sended
 *       400:
 *         description: Validation error
 * /api/forgot-password-change:
 *   post:
 *     summary: Change the forgot password with token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               email:
 *                 type: string
 *               token:
 *                 type: number
 *               newPassword:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *             example:
 *               email: john.doe@example.com
 *               token: 123456
 *               newPassword: password@123
 *               confirmPassword: password@123
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *             example:
 *               code: 200
 *               message: Otp sended
 *       400:
 *         description: Validation error
 */
