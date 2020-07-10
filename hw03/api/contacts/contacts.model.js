const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactsSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    subscription: String,
    password: String,
    token: String,
  },
  {
    versionKey: false,
  },
);

const contactsModel = mongoose.model('Contacts', contactsSchema);

module.exports = contactsModel;
