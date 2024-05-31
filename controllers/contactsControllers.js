import {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContactById,
} from "../services/contactsServices.js";
import HttpError from "../helpers/HttpError.js";
import {
  createContactSchema,
  updateContactSchema,
} from "../schemas/contactsSchemas.js";

export const getAllContacts = async (req, res) => {
  try {
    const contacts = await listContacts();
    res.status(200).json(contacts);
  } catch (error) {
    console.log(err);
  }
};

export const getOneContact = async (req, res, next) => {
  try {
    const contact = await getContactById(req.params.id);
    if (!contact) {
      throw HttpError(404, "Not found");
    }
    res.status(200).json(contact);
  } catch (err) {
    next(err);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const contact = await removeContact(req.params.id);
    if (!contact) {
      throw HttpError(404, "Not found");
    }
    res.status(200).json(contact);
  } catch (err) {
    next(err);
  }
};

export const createContact = async (req, res) => {
  try {
    const contact = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    };

    const { error } = createContactSchema.validate(contact, {
      convert: false,
    });
    if (typeof error !== "undefined") {
      return res.status(400).json({ message: error.message });
    }

    const { name, email, phone } = req.body;
    const newContact = await addContact(name, email, phone);
    res.status(201).json(newContact);
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const infoToUpdate = req.body;

    if (Object.keys(infoToUpdate).length === 0) {
      return res
        .status(400)
        .json({ message: "Body must have at least one field" });
    }

    const { error } = updateContactSchema.validate(infoToUpdate, {
      convert: false,
    });
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const updatedContact = await updateContactById(id, infoToUpdate);

    if (!updatedContact) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(200).json(updatedContact);
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
