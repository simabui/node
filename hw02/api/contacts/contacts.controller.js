const fs = require("fs");
const path = require("path");
const Joi = require("@hapi/joi");
const { string } = require("@hapi/joi");
const isEmpty = require("lodash.isempty");
const { promises: fsPromises } = fs;

const contactsPath = path.join(__dirname, "../../db/contacts.json");

class ContactsController {
  get getContacts() {
    return this._getContacts.bind(this);
  }
  get getContact() {
    return this._getContact.bind(this);
  }
  get addContact() {
    return this._addContact.bind(this);
  }
  get removeContact() {
    return this._removeContact.bind(this);
  }
  get updateContact() {
    return this._updateContact.bind(this);
  }

  async listContacts(res) {
    try {
      const data = await fsPromises.readFile(contactsPath, "utf-8");
      return JSON.parse(data);
    } catch (err) {
      console.log(err);
    }
  }

  async editContacts(res, data) {
    try {
      return await fsPromises.writeFile(contactsPath, JSON.stringify(data, null, 2));
    } catch ({ status, message }) {
      res.status(status).send(message);
    }
  }

  async findContact(res, id) {
    try {
      const contacts = await this.listContacts();
      const contact = contacts.find((contact) => contact.id === id);

      if (!contact) {
        throw new NotFoundError("Not found");
      }

      return contact;
    } catch (err) {
      res.status(404).send(err.message);
    }
  }

  validateAddUser(req, res, next) {
    const schema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().required(),
      phone: Joi.string().required(),
    });
    const validation = schema.validate(req.body);

    if (validation.error) {
      return res.status(400).send(validation.error.message);
    }
    next();
  }

  validateUpdateUser(req, res, next) {
    const schema = Joi.object({
      name: Joi.string(),
      email: Joi.string(),
      phone: Joi.string(),
    });
    const validation = schema.validate(req.body);

    if (validation.error) {
      return res.status(400).send(validation.error.message);
    }
    next();
  }

  // GET
  async _getContacts(req, res) {
    try {
      const contacts = await this.listContacts();

      res.status(200).send(contacts);
    } catch (err) {
      res.status(err.status).send(err.message);
    }
  }

  async _getContact(req, res) {
    try {
      const { contactid } = req.params;
      const targetContact = await this.findContact(res, +contactid);

      res.status(200).send(targetContact);
    } catch (err) {
      res.status(err.status).send(err);
    }
  }

  // POST
  async _addContact(req, res) {
    try {
      const contacts = await this.listContacts();
      const newContact = { ...req.body, id: contacts.length + 1 };
      contacts.push(newContact);
      this.editContacts(res, contacts);

      res.status(200).send(req.body);
    } catch ({ status, message }) {
      res.status(status).send(message);
    }
  }

  // DELETE
  async _removeContact(req, res) {
    try {
      const { contactid } = req.params;
      const contacts = await this.listContacts();
      const targetContact = await this.findContact(res, +contactid);
      const newContacts = contacts.filter((contact) => contact.id !== targetContact.id);
      await this.editContacts(res, newContacts);

      res.status(200).send(newContacts);
    } catch (err) {
      res.status(400).send();
    }
  }

  // PATCH
  async _updateContact(req, res) {
    try {
      const id = parseInt(req.params.contactid);
      const contacts = await this.listContacts();
      const index = contacts.findIndex((contact) => contact.id === id);

      if (!contacts[index]) throw new NotFoundError("Not found");
      if (isEmpty(req.body)) return res.status(404).send("missing fields");

      contacts[index] = { ...contacts[index], ...req.body };
      await this.editContacts(res, contacts);
      res.status(200).send(contacts);
    } catch (err) {
      res.status(err.status).send(err.message);
    }
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);

    this.status = 404;
    delete this.stack;
  }
}

module.exports = new ContactsController();
