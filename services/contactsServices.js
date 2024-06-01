import Contact from "../models/Contact.js";

export const getAllContacts = () => Contact.find({}, "-createdAt -updatedAt");

export const addContact = (data) => Contact.create(data);

export const getContactById = async (id) => {
  const data = Contact.findById(id);
  return data;
};

export const updateContactById = (id, data) =>
  Contact.findByIdAndUpdate(id, data);

export const removeContact = (id) => Contact.findByIdAndDelete(id);

export const updateStatusContact = (id, data) =>
  Contact.findByIdAndUpdate(id, data);
