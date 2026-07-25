"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UnitImageModule = require("./standardMap/default/unit-image");
const BoardComponentModule = require("./standardMap/default/board-component");
var standardMap;
(function (standardMap) {
    class UnitImage extends UnitImageModule.UnitImage {
    }
    standardMap.UnitImage = UnitImage;
    class BoardComponent extends BoardComponentModule.BoardComponent {
    }
    standardMap.BoardComponent = BoardComponent;
})(standardMap = exports.standardMap || (exports.standardMap = {}));

//# sourceMappingURL=standardMap.js.map
