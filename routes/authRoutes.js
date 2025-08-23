const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authController = require("../controllers/authController");

// auth model
router.post("/login", authController.login);
router.post("/logout", authMiddleware, authController.logout);
router.post("/refresh-token", authController.refreshToken);
router.post("/change-password", authMiddleware, authController.changePassword);

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
 */
