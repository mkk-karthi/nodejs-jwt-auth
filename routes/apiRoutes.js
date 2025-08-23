const express = require("express");
const upload = require("../services/multer");
const router = express.Router();
const apiRouter = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authRoute = require("./authRoutes");

// user model
const userController = require("../controllers/userController");
apiRouter.get("/users", authMiddleware, userController.list);
apiRouter.post("/user", upload.single("avatar"), userController.create);
apiRouter.get("/user/:id", authMiddleware, userController.view);
apiRouter.put(
  "/user/:id",
  authMiddleware,
  upload.single("avatar"),
  userController.update
);
apiRouter.delete("/user/:id", authMiddleware, userController.delete);

apiRouter.use("/", authRoute);
router.use("/api", apiRouter);

router.get("/", (req, res) => {
  res.send("Node version " + process.version);
});
router.all(/(.*)/, (req, res) => {
  res.status(404).send("Not found");
});

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management api
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ApiResponse"
 * /api/user:
 *   post:
 *     summary: Create an user
 *     description: Create an user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/user"
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
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: User created
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/validationError"
 * /api/user/{id}:
 *   get:
 *     summary: Get user by id
 *     description: Get user by id
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Data found
 *                 data:
 *                   $ref: "#/components/schemas/user"
 *       404:
 *         description: User not found
 *   put:
 *     summary: Update user by id
 *     description: Update user by id
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/user"
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
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: User updated
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/validationError"
 *       404:
 *         description: User not found
 *   delete:
 *     summary: Delete user by id
 *     description: Delete user by id
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
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
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: User deleted
 *       404:
 *         description: User not found
 *
 * components:
 *   schemas:
 *     user:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: Encrypted id
 *           readOnly: true
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         dob:
 *           type: string
 *           description: Date Of Birth
 *         avatar:
 *           type: string
 *           description: Avatar image
 *         status:
 *           type: integer
 *           description: 1-active, 2-inactive
 *           enum:
 *             - 1
 *             - 2
 *       example:
 *         id: a646e9a74ca5affc4e3e65c4394813f7
 *         name: John Doe
 *         email: john.doe@example.com
 *         password: Password@123
 *         dob: 2000-06-12
 *         avatar: ''
 *         status: 1
 *     ApiResponse:
 *       type: object
 *       properties:
 *         code:
 *           type: integer
 *           example: 200
 *         message:
 *           type: string
 *           example: Data found
 *         data:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/user"
 *     validationError:
 *       type: object
 *       properties:
 *         code:
 *           type: integer
 *           example: 400
 *         message:
 *           type: string
 *           example: validation failed
 */
