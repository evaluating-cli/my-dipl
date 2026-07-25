"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const diplomacy = require("js-diplomacy");
const { England, Russia, France, Germany, Italy, Austria, Turkey } = diplomacy.standardMap.Power;
function powers(power) {
    switch (power) {
        case England:
            return 'rgb(239, 154, 154)';
        case Russia:
            return 'rgb(206, 147, 216)';
        case France:
            return 'rgb(144, 202, 249)';
        case Germany:
            return 'rgb(150, 150, 150)';
        case Italy:
            return 'rgb(159, 168, 218)';
        case Austria:
            return 'rgb(255, 224, 130)';
        case Turkey:
            return 'rgb(255, 171, 145)';
    }
}
class Colors {
    constructor() {
        this.neutralProvince = "rgb(129, 199, 132)";
        this.fill = "black";
        this.border = "white";
        this.dislodged = "red";
        this.margin = "white";
    }
    power(power) { return powers(power); }
}
exports.Colors = Colors;
exports.colors = new Colors();
exports.size = {
    unitRadius: Math.sqrt(30 * 30 + 20 * 20) / 2,
    arrowHeadLength: Math.sqrt(30 * 30 + 20 * 20) / 4,
    marginStrokeWidth: 0.5,
    strokeWidth: 2,
    standoffRadius: 10,
    standoffWidth: 3,
    standoffMarginWidth: 0.5
};

//# sourceMappingURL=configs.js.map
