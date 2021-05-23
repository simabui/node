const express = require("express");
const Analytics = require("./analytics");
require("dotenv").config();

const app = express();

async function getPortfolioData() {
  const scopes = ["https://www.googleapis.com/auth/analytics", "https://www.googleapis.com/auth/analytics.edit"];
  const client_email = process.env.CLIENT_EMAIL;
  const accountId = process.env.ACCOUNT_ID;
  const viewId = process.env.VIEW_ID;
  const private_key = process.env.PRIVATE_KEY.replace(/\\n/g, "\n");

  const myProject = new Analytics(scopes, client_email, accountId, viewId, private_key);
  const data = await myProject.getAnalyticsData();
  console.log(data);
}
const listener = app.listen(process.env.PORT, () => {
  getPortfolioData();
  console.log("Your app is listening on port " + listener.address().port);
});
