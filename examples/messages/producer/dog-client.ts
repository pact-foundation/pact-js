const axios = require("axios");

// API integration client
exports.dogApiClient = (id: number) => {
  return new Promise((resolve, reject) => {
    resolve({
      id,
      name: "fido",
      type: "bulldog",
    });
  });
};
