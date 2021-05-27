const fs = require("fs");

const Data = {
  storeData(data) {
    try {
      fs.writeFileSync("./data/data.json", JSON.stringify(data));
    } catch (error) {
      console.error(error);
    }
  },

  loadData(dataFilePath) {
    try {
      const data = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
      return data;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  getFileUpdatedData(path) {
    const stats = fs.statSync(path);
    return stats.mtime;
  },

  isToday(someDate) {
    const today = new Date();

    return (
      someDate.getDate() === today.getDate() && someDate.getMonth() === today.getMonth() && someDate.getFullYear() === today.getFullYear()
    );
  },

  wasModifiedToday(path) {
    return this.isToday(this.getFileUpdatedData(path));
  },
};

module.exports = Data;
