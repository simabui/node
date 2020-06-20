const fs = require("fs");
const path = require("path");
const { promises: fsPromises } = fs;

const contactsPath = path.join(__dirname, "./db/contacts.json");

async function listContacts() {
  const data = await fsPromises.readFile(contactsPath, "utf-8");
  return JSON.parse(data);
}

async function getContactById(contactId) {
  const contacts = await listContacts();
  const contact = contacts.find((contact) => contact.id === contactId);
  console.table(contact);
}

async function removeContact(contactId) {
  const contacts = await listContacts();
  const contact = contacts.filter((contact) => contact.id !== contactId);
  return fsPromises.writeFile(contactsPath, JSON.stringify(contact));
}

async function addContact(name, email, phone) {
  const contacts = await listContacts();
  const newContact = { name, email, phone };
  contacts.push(newContact);
  return fsPromises.writeFile(contactsPath, JSON.stringify(contacts));
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
};
