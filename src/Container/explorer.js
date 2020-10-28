"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.Explorer = void 0;
var vscode = require("vscode");
var path = require("path");
var Explorer = /** @class */ (function (_super) {
    __extends(Explorer, _super);
    function Explorer(label, contextValue, collapsibleState, explorerId, type, tooltip, data, lightIconPath, darkIconPath) {
        if (type === void 0) { type = ""; }
        var _this = _super.call(this, label, collapsibleState) || this;
        _this.label = label;
        _this.contextValue = contextValue;
        _this.collapsibleState = collapsibleState;
        _this.explorerId = explorerId;
        _this.type = type;
        _this.tooltip = tooltip;
        _this.data = data;
        _this.lightIconPath = lightIconPath;
        _this.darkIconPath = darkIconPath;
        _this.iconPath = {
            light: _this.lightIconPath ? _this.lightIconPath : path.join("/"),
            dark: _this.darkIconPath ? _this.darkIconPath : path.join("/")
        };
        _this.contextValue = contextValue;
        // console.log(tooltip)
        _this.tooltip = tooltip ? tooltip : "" + _this.label;
        _this.explorerId = explorerId;
        _this.type = type;
        _this.data = data;
        _this.lightIconPath = lightIconPath;
        _this.darkIconPath = darkIconPath;
        return _this;
    }
    return Explorer;
}(vscode.TreeItem));
exports.Explorer = Explorer;
