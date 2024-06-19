import multer from "multer";
import path from "path";
import HttpError from "../helpers/HttpError.js";

const destination = path.resolve("tmp");

const storage = multer.diskStorage({
  destination,
  filename: (req, file, cb) => {
    const uniquePreffix = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniquePreffix}_${file.originalname}`);
  },
});

const limits = {
  fileSize: 5 * 1024 * 1024,
};

const fileFilter = (req, file, cb) => {
  const extension = file.originalname.split(".").pop();
  if (extension === "jpg" || extension === "jpeg" || extension === "png") {
    cb(null, true);
  } else {
    cb(new HttpError(400, "Only jpg, jpeg and png files are allowed"), false);
  }
};

const upload = multer({ storage, limits, fileFilter });

export default upload;
