const fs = require("fs");
const path = require("path");
const { promises: fsPromises } = fs;

const contactsPath = path.join(__dirname, "./db/contacts.json");

async function listContacts() {
  try {
    const data = await fsPromises.readFile(contactsPath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.log(err);
  }
}

async function editContacts(data) {
  try {
    return await fsPromises.writeFile(contactsPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.log(err);
  }
}

async function getContactById(contactId) {
  try {
    const contacts = await listContacts();
    const contact = contacts.find((contact) => contact.id === contactId);
    console.table(contact);
  } catch (err) {
    console.log(err);
  }
}

async function removeContact(contactId) {
  try {
    const contacts = await listContacts();
    const contact = contacts.filter((contact) => contact.id !== contactId);
    return editContacts(contact);
  } catch (err) {
    console.log(err);
  }
}

async function addContact(name, email, phone) {
  try {
    const contacts = await listContacts();
    const newContact = { name, email, phone, id: contacts.length + 1 };
    contacts.push(newContact);
    return editContacts(contacts);
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
};
