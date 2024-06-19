import express from "express";
import authControllers from "../controllers/authControllers.js";
import isEmptyBody from "../middlewares/isEmptyBody.js";
import authenticate from "../middlewares/authenticate.js";
import validateBody from "../helpers/validateBody.js";
import { authSignInSchema, authSignUpSchema } from "../schemas/authSchemas.js";
import upload from "../middlewares/upload.js";

const authRouter = express.Router();

authRouter.post(
  "/register",
  upload.single("avatar"),
  isEmptyBody,
  validateBody(authSignUpSchema),
  authControllers.signup
);

authRouter.patch(
  "/avatar",
  authenticate,
  upload.single("avatar"),
  authControllers.updateAvatar
);

authRouter.get("/avatar/:fileName", authenticate, authControllers.getAvatar);

authRouter.post(
  "/login",
  isEmptyBody,
  validateBody(authSignInSchema),
  authControllers.signin
);

authRouter.get("/current", authenticate, authControllers.getCurrent);

authRouter.post("/logout", authenticate, authControllers.signout);

export default authRouter;
