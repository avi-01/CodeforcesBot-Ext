"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var fs = require("fs");
var path = require("path");
var axios = require("axios");
var cheerio = require("cheerio");
var qs = require("querystring");
var baseUrl = "https://codeforces.com";
var resDir = path.join(__filename, "..", "..", "..", "..", "res");
var dataFile = path.join(resDir, "Data", "data.json");
var user = {
    handleOrEmail: "testBot",
    password: "testbot@123"
};
var session = {
    csrfToken: "",
    cookie: ""
};
function login() {
    return __awaiter(this, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            data = JSON.parse(readFile(dataFile));
            if (!data || !data.cookie || !data.lastUpdate || Date.now() - data.lastUpdate > 3600000) {
                return [2 /*return*/, getCsrfAndJid()
                        .then(function () {
                        return requestLogin();
                    })
                        .then(function () {
                        data.cookie = session.cookie;
                        data.lastUpdate = Date.now();
                        console.log("Time: " + data.lastUpdate);
                        createFile(dataFile, JSON.stringify(data));
                        return data.cookie;
                    })];
            }
            else {
                return [2 /*return*/, data.cookie];
            }
            return [2 /*return*/];
        });
    });
}
function getCsrfAndJid() {
    return axios
        .get(baseUrl + "/enter")
        .then(function (res) {
        session.cookie = res["headers"]["set-cookie"][0].split(";")[0];
        var $ = cheerio.load(res.data);
        session.csrfToken = $("meta[name='X-Csrf-Token']")[0].attribs["content"];
        // console.log(session)
    })["catch"](function (err) {
        handleError(err);
    });
}
function requestLogin() {
    console.log("Logging...");
    var url = baseUrl + "/enter";
    var options = {
        headers: {
            "content-type": "application/x-www-form-urlencoded",
            Cookie: session.cookie
        }
    };
    var data = __assign(__assign({}, user), { csrf_token: session.csrfToken, action: "enter" });
    return axios
        .post(url, qs.stringify(data), options)
        .then(function (res) {
        var $ = cheerio.load(res.data);
        var userId = $($(".lang-chooser a")[2]).html();
        session.csrfToken = $("meta[name='X-Csrf-Token']")[0].attribs["content"];
        console.log("Login Successful. Welcome " + userId + "!!!");
    })["catch"](function (err) {
        handleError(err);
    });
}
function readFile(file) {
    checkExist(file, fs.existsSync(file));
    return fs.readFileSync(file);
}
function createFile(fileName, data) {
    fs.writeFile(fileName, data, function (err) { return err ? handleError(err) : null; });
}
function checkExist(obj, exist) {
    if (!exist) {
        handleError(obj + " does not Exist");
    }
}
function handleError(error) {
    console.log(error);
    console.log("Failed to login!!!!!!!!!!");
    throw new Error("Failed to login!!!!!!!");
}
exports["default"] = login;
