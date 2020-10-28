"use strict";
exports.__esModule = true;
var axios_1 = require("../../../helper/axios/axios");
var path = require("path");
var resPath = path.join(__filename, "..", "..", "..", "..", "..", "res");
var Problem = /** @class */ (function () {
    function Problem(userHandle, contestId, id) {
        this.name = "";
        this.points = 0;
        this.rejectedAttemptCount = 0;
        this.bestSubmissionTime = 0;
        this.practiceAc = false;
        this.userHandle = userHandle;
        this.contestId = contestId;
        this.id = id;
    }
    Problem.prototype.fetchProblemData = function () {
        var _this = this;
        var problemApiUrl = "/api/contest.standings?contestId=" + this.contestId + "&handles=" + this.userHandle + "&showUnofficial=true";
        return axios_1["default"].get(problemApiUrl).then(function (res) {
            var data = res.data.result;
            _this.name = data.problems.filter(function (problem) {
                return problem.index === _this.id;
            })[0].name;
            var problemIndex = _this.id.charCodeAt(0) - "A".charCodeAt(0);
            var problemObject = data.rows[0].problemResults[problemIndex];
            _this.rejectedAttemptCount = problemObject.rejectedAttemptCount;
            _this.bestSubmissionTime = problemObject.bestSubmissionTimeSeconds;
            _this.points = problemObject.points;
            if (data.rows.length > 1) {
                var problemPractObject = data.rows[1].problemResults[problemIndex];
                _this.practiceAc = problemPractObject.points !== 0;
            }
        });
    };
    Problem.prototype.setProblemData = function (name, points, rejectedAttemptCount, bestSubmissionTime) {
        this.name = name;
        this.points = points;
        this.rejectedAttemptCount = rejectedAttemptCount;
        this.bestSubmissionTime = bestSubmissionTime;
    };
    return Problem;
}());
exports["default"] = Problem;
