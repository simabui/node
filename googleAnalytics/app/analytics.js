const { google } = require("googleapis");
const { analyticsreporting } = require("googleapis/build/src/apis/analyticsreporting");
const moment = require("moment");
const fs = require("fs");
const Data = require("./write");
require("dotenv").config();

const dataFilePath = "./data/data.json";

class Analytics {
  constructor(scopes, email, accountId, viewId, private_key) {
    this.scopes = scopes;
    this.client_email = email;
    this.accountId = accountId;
    this.viewId = viewId;
    this.private_key = private_key;
    this.jwt = new google.auth.JWT(this.client_email, null, this.private_key, this.scopes);
  }

  async getPropertiesList() {
    const response = await this.jwt.authorize();

    try {
      const result = await google.analytics("v3").management.webproperties.list({
        auth: this.jwt,
        accountId: this.accountId,
      });
      return result.data.items;
    } catch (e) {
      console.log(e);
    }
  }

  async getDailyData(startDate, endDate, organic = false) {
    const analyticsreporting = google.analyticsreporting({
      version: "v4",
      auth: this.jwt,
    });

    let filter = "";
    if (organic) {
      filter = "ga:medium==organic";
    }

    const res = await analyticsreporting.reports.batchGet({
      requestBody: {
        reportRequests: [
          {
            viewId: this.viewId,
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

    return res.data.reports[0].data.totals[0].values[0];
  }

  async getDataOfItem(item, daysAgo60, daysAgo30) {
    return {
      property: item.websiteUrl,
      yesterday: {
        total: await this.getDailyData("yesterday", "yesterday"),
        organic: await this.getDailyData("yesterday", "yesterday", true),
      },
      monthly: {
        total: await this.getDailyData(daysAgo60, daysAgo30),
        organic: await this.getDailyData(daysAgo60, daysAgo30, true),
      },
    };
  }

  async getData() {
    const daysAgo30 = moment().subtract(30, "days").format("YYYY-MM-DD");
    const daysAgo60 = moment().subtract(60, "days").format("YYYY-MM-DD");
    const list = await this.getPropertiesList();

    return await Promise.all(list.map((item) => this.getDataOfItem(item, daysAgo60, daysAgo30)));
  }

  async getTodayData() {
    const list = await this.getPropertiesList();
    const getDataOfItem = async (item) => {
      return {
        property: item.websiteUrl,
        today: {
          total: await this.getDailyData("today", "today"),
          organic: await this.getDailyData("today", "today", true),
        },
      };
    };
    return await Promise.all(list.map((item) => getDataOfItem(item)));
  }

  async getAnalyticsData() {
    let data;

    if (fs.existsSync(dataFilePath) && Data.wasModifiedToday(dataFilePath)) {
      data = Data.loadData(dataFilePath);
    } else {
      data = {
        aggregate: await this.getData(),
      };
      Data.storeData(data);
    }
    data.today = await this.getTodayData();

    return data;
  }
}

module.exports = Analytics;
