import * as contactsServices from "../services/contactsServices.js";
import { updateFavoriteSchema } from "../schemas/contactsSchemas.js";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../decorators/ctrlWrapper.js";

const getAllContacts = async (req, res, next) => {
  const { _id: owner } = req.user;
  const filter = { owner };
  const fields = "-createdAt -updatedAt";
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  const settings = { skip, limit };
  const result = await contactsServices.listContacts({
    filter,
    fields,
    settings,
  });
  const total = await contactsServices.countContacts(filter);

  console.log(result);

  res.json({
    total,
    page: Number(page),
    limit: Number(limit),
    result,
    pages: Math.ceil(total / limit),
  });
};

const getOneContact = async (req, res, next) => {
  const { id: _id } = req.params;
  const { _id: owner } = req.user;
  const result = await contactsServices.getContactById({ _id, owner });
  if (!result) {
    throw HttpError(404, `Contact with id=${id} not found`);
  }

  res.json(result);
};

const createContact = async (req, res, next) => {
  const { _id: owner } = req.user;
  const result = await contactsServices.addContact({ ...req.body, owner });

  res.status(201).json(result);
};

const updateContact = async (req, res, next) => {
  const { id: _id } = req.params;
  const { _id: owner } = req.user;
  const result = await contactsServices.updateContactById(
    { _id, owner },
    req.body
  );
  if (!result) {
    throw HttpError(404, `Contact with id=${id} not found`);
  }

  res.json(result);
};

const updateFavorite = async (req, res, next) => {
  try {
    const { error } = updateFavoriteSchema.validate(req.body);
    if (error) {
      return next(HttpError(400, error.message));
    }

    const { id: _id } = req.params;
    const { _id: owner } = req.user;
    const contact = await contactsServices.getContactById({ _id, owner });
    if (!contact) {
      return res.status(404).json({ message: "Not found" });
    }

    const result = await contactsServices.updateContactById(
      { _id, owner },
      req.body
    );
    if (!result) {
      return res.status(404).json({ message: "Not found" });
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const deleteContact = async (req, res, next) => {
  const { id: _id } = req.params;
  const { _id: owner } = req.user;
  const result = await contactsServices.removeContact({ _id, owner });
  if (!result) {
    throw HttpError(404, `Contact with id=${id} not found`);
  }

  res.json({
    message: "Delete success",
  });
};

export default {
  getAllContacts: ctrlWrapper(getAllContacts),
  getOneContact: ctrlWrapper(getOneContact),
  createContact: ctrlWrapper(createContact),
  updateContact: ctrlWrapper(updateContact),
  updateFavorite: ctrlWrapper(updateFavorite),
  deleteContact: ctrlWrapper(deleteContact),
};
