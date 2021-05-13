const express = require("express");
const { google } = require("googleapis");
require("dotenv").config();

const app = express();

const scopes = "https://www.googleapis/auth/analytics.readonly";
const client_email = process.env.CLIENT_EMAIL;
const private_key = process.env.PRIVATE_KEY.replace(/\\n/g, "\n");

const jwt = new google.auth.JWT(client_email, null, private_key, scopes);

// FIXME: fix credentials error
async function getData() {
  const response = await jwt.authorize();

  try {
    constresult = await google.analytics("v3").management.webproperties.list({
      auth: jwt,
      accountId: process.env.ACCOUNT_ID,
    });
    console.log(result.data.totalResults);
  } catch (e) {
    console.log(e);
  }
}
getData();

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
