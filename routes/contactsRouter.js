import express from "express";
import contactsControllers from "../controllers/contactsControllers.js";
import isEmptyBody from "../middlewares/isEmptyBody.js";
import authenticate from "../middlewares/authenticate.js";
import isValidID from "../middlewares/isValidId.js";

const contactsRouter = express.Router();

contactsRouter.use(authenticate);

contactsRouter.get("/", contactsControllers.getAllContacts);

contactsRouter.get("/:id", isValidID, contactsControllers.getOneContact);

contactsRouter.delete("/:id", isValidID, contactsControllers.deleteContact);

contactsRouter.post("/", isEmptyBody, contactsControllers.createContact);

contactsRouter.put(
  "/:id",
  isValidID,
  isEmptyBody,
  contactsControllers.updateContact
);

contactsRouter.patch(
  "/:id/favorite",
  isValidID,
  isEmptyBody,
  contactsControllers.updateContact
);

export default contactsRouter;
