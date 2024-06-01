import express from "express";
import contactsControllers from "../controllers/contactsControllers.js";
import isBodyEmpty from "../middlewares/isBodyEmpty.js";
import validateBody from "../decorators/validateBody.js";
import {
  createContactSchema,
  updateContactSchema,
  updateStatusSchema,
} from "../schemas/contactsSchemas.js";
import isValidID from "../middlewares/isValidId.js";

const contactsRouter = express.Router();

contactsRouter.get("/", contactsControllers.getAll);

contactsRouter.get("/:id", isValidID, contactsControllers.getOneContact);

contactsRouter.delete("/:id", isValidID, contactsControllers.deleteContact);

contactsRouter.post(
  "/",
  validateBody(createContactSchema),
  isBodyEmpty,
  contactsControllers.createContact
);

contactsRouter.put(
  "/:id",
  isValidID,
  validateBody(updateContactSchema),
  isBodyEmpty,
  contactsControllers.updateContact
);

contactsRouter.patch(
  "/:id/favorite",
  isValidID,
  isBodyEmpty,
  validateBody(updateStatusSchema),
  contactsControllers.updateContactStatus
);

export default contactsRouter;
