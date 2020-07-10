const Joi = require('@hapi/joi');
const isEmpty = require('lodash.isempty');
const contactsModel = require('./contacts.model');

const postValidation = {
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
  subscription: Joi.string(),
  password: Joi.string(),
  token: Joi.string().empty(''),
};

const patchValidation = {
  name: Joi.string(),
  email: Joi.string(),
  phone: Joi.string(),
  subscription: Joi.string(),
  password: Joi.string(),
  token: Joi.string().empty(''),
};

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

  validateAddContact(req, res, next) {
    const schema = Joi.object(postValidation);
    const validation = schema.validate(req.body);

    if (validation.error) return handleValidationError(res, validation);

    next();
  }

  validateUpdateContact(req, res, next) {
    const schema = Joi.object(patchValidation);
    const validation = schema.validate(req.body);

    if (validation.error) return handleValidationError(res, validation);

    next();
  }

  // GET
  async _getContacts(req, res) {
    try {
      const contacts = await contactsModel.find();

      res.status(200).send(contacts);
    } catch (err) {
      res.status(400).send(err.message);
    }
  }

  async _getContact(req, res) {
    try {
      const { contactid } = req.params;
      const contact = await contactsModel.findById(contactid);

      res.status(200).send(contact);
    } catch (err) {
      res.status(400).send(err.message);
    }
  }

  // POST
  async _addContact(req, res) {
    try {
      const newContact = { ...req.body };
      const existedContact = await contactsModel.findOne({
        email: newContact.email,
      });

      if (existedContact)
        return res.status(400).send('Contact with such email already exists');

      await contactsModel.create(newContact, (err, contact) => {
        if (!err)
          return res.status(200).send(`Contact ${contact.name} created`);
      });
    } catch (err) {
      res.status(400).send(err.message);
    }
  }

  // DELETE
  async _removeContact(req, res) {
    try {
      const { contactid } = req.params;

      await contactsModel.findByIdAndRemove(contactid, function (err) {
        if (!err) return res.status(200).send(`Contact deleted`);
      });

      res.status(200).send();
    } catch (err) {
      res.status(400).send(err.message);
    }
  }

  // PATCH
  async _updateContact(req, res) {
    try {
      const { contactid } = req.params;
      const updatedContact = { ...req.body };

      if (isEmpty(req.body)) return res.status(404).send('missing fields');

      const newContact = await contactsModel.findByIdAndUpdate(
        contactid,
        updatedContact,
        { new: true },
      );

      res.status(200).send(newContact);
    } catch (err) {
      res.status(400).send(err.message);
    }
  }
}

function handleValidationError(res, val) {
  return res.status(400).send(val.error.message);
}
module.exports = new ContactsController();
