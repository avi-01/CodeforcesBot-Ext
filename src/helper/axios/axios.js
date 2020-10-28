"use strict";
exports.__esModule = true;
var axios_1 = require("axios");
var login_1 = require("../Login/login");
var instance = axios_1["default"].create({ baseURL: "https://codeforces.com" });
instance.interceptors.request.use(function (config) {
    // console.log(config);
    return login_1["default"]()
        .then(function (cookie) {
        // console.log(cookie)
        config.headers.Cookie = cookie;
        return config;
    })["catch"](function (error) {
        return Promise.reject(error);
    });
});
exports["default"] = instance;
