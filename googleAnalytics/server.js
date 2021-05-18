const express = require("express");
const { google } = require("googleapis");
const { analyticsreporting } = require("googleapis/build/src/apis/analyticsreporting");
require("dotenv").config();

const app = express();

const scopes = ["https://www.googleapis.com/auth/analytics", "https://www.googleapis.com/auth/analytics.edit"];
const client_email = process.env.CLIENT_EMAIL;
const private_key = process.env.PRIVATE_KEY.replace(/\\n/g, "\n");

const jwt = new google.auth.JWT(client_email, null, private_key, scopes);

async function getPropertiesList() {
  const response = await jwt.authorize();

  try {
    const result = await google.analytics("v3").management.webproperties.list({
      auth: jwt,
      accountId: process.env.ACCOUNT_ID,
    });
    return result.data.totalResults;
  } catch (e) {
    console.log(e);
  }
}

async function getDailyData(viewId, startDate, endDate, organic = false) {
  const analyticsreporting = google.analyticsreporting({
    version: "v4",
    auth: jwt,
  });

  let filter = "";
  if (organic) {
    filter = "ga:medium==organic";
  }

  const res = await analyticsreporting.reports.batchGet({
    requestBody: {
      reportRequests: [
        {
          viewId: viewId,
          dateRanges: [
            {
              startDate: startDate,
              endDate: endDate,
            },
          ],
          metrics: [
            {
              expression: "ga:sessions",
            },
          ],
          filtersExpression: filter,
        },
      ],
    },
  });
  return res.data.reposrts[0].data.totals[0].values[0];
}

// FIXME: get correct viewId
async function getData() {
  result = await getDailyData("272302484", "today", "today");
}

getData();

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
