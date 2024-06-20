import { nanoid } from "nanoid";
import fs from "fs/promises";
import path from "path";
import { findUser, saveUser, updateUser } from "../services/authServices.js";
import HttpError from "../helpers/HttpError.js";
import compareHash from "../helpers/compareHash.js";
import { createToken } from "../helpers/jwt.js";
import Jimp from "jimp";
import gravatar from "gravatar";
import sendEmail from "../helpers/sendEmail.js";
import ctrlWrapper from "../decorators/ctrlWrapper.js";

const avatarDir = path.resolve("public", "avatars");

const signup = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw HttpError(400, "Missing required fields");
  }
  const user = await findUser({ email });
  if (user) {
    throw HttpError(409, "Email already in use");
  }

  const verificationToken = nanoid();

  const avatarURL = gravatar.url(email);
  const newUser = await saveUser({ ...req.body, avatarURL, verificationToken });

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="http://localhost:3000/users/verify/${verificationToken}">Verify email</a>`,
  };

  await sendEmail(verifyEmail);

  return res.status(201).json({
    user: {
      email: newUser.email,
      subscription: "starter",
    },
  });
};

const verify = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await findUser({ verificationToken });

  if (!user) {
    throw HttpError(404, "User not found");
  }
  await updateUser(
    { _id: user._id },
    { verify: true, verificationToken: null }
  );

  const verifiedEmail = {
    to: user.email,
    subject: "Verification Successful",
    html: `<p>Your email has been successfully verified.</p>`,
  };

  await sendEmail(verifiedEmail);

  res.json({
    message: "Verification successful",
  });
};

const resendVerifyEmail = async (req, res) => {
  const { email } = req.body;
  const user = await findUser({ email });
  if (!user) {
    throw HttpError(404, "User not found");
  }

  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="http://localhost:3000/users/verify/${user.verificationToken}">Verify email</a>`,
  };

  await sendEmail(verifyEmail);

  res.json({
    message: "Verification email sent",
  });
};

const signin = async (req, res) => {
  const { email, password } = req.body;
  const user = await findUser({ email });
  if (!user) {
    throw HttpError(401, "Email or password invalid");
  }

  if (user.verify === false) {
    throw HttpError(401, "Email not verified");
  }

  const comparePassword = await compareHash(password, user.password);
  if (!comparePassword) {
    throw HttpError(401, "Email or password invalid");
  }

  const { _id: id } = user;
  const payload = {
    id,
  };

  const token = createToken(payload);
  await updateUser({ _id: id }, { token });

  return res.json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const getCurrent = (req, res) => {
  const { username, email } = req.user;

  return res.json({
    email,
    subscription: "starter",
  });
};

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { filename, path: tempPath } = req.file;

  if (!filename) {
    throw HttpError(400, "File is missing");
  }

  try {
    const image = await Jimp.read(tempPath);

    await image.resize(250, 250);

    const filePath = path.join(avatarDir, filename);

    await image.writeAsync(filePath);

    const avatarURL = `/avatars/${filename}`;

    const result = await updateUser({ _id }, { avatarURL });

    res.status(200).json({ avatarURL: result.avatarURL });
  } catch (error) {
    console.error("Error processing image:", error);
    throw HttpError(500, "Failed to process the image");
  } finally {
    await fs.unlink(tempPath);
  }
};

const getAvatar = async (req, res) => {
  const { _id } = req.user;
  const user = await findUser({ _id });
  return res.json({ avatarURL: user.avatarURL });
};

const signout = async (req, res) => {
  const { _id } = req.user;
  await updateUser({ _id }, { token: "" });

  return res.status(204).send();
};

export default {
  signup: ctrlWrapper(signup),
  verify: ctrlWrapper(verify),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
  signin: ctrlWrapper(signin),
  getCurrent: ctrlWrapper(getCurrent),
  updateAvatar: ctrlWrapper(updateAvatar),
  signout: ctrlWrapper(signout),
  getAvatar: ctrlWrapper(getAvatar),
};
