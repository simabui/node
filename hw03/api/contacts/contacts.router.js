const express = require('express');
const ContactsControl = require('./contacts.controller');
const contactsRouter = express.Router();

contactsRouter.get('/', ContactsControl.getContacts);
contactsRouter.get('/:contactid', ContactsControl.getContact);
contactsRouter.post(
  '/',
  ContactsControl.validateAddContact,
  ContactsControl.addContact,
);
contactsRouter.delete('/:contactid', ContactsControl.removeContact);
contactsRouter.patch(
  '/:contactid',
  ContactsControl.validateUpdateContact,
  ContactsControl.updateContact,
);

module.exports = contactsRouter;
