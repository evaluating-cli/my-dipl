"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const units_component_1 = require("./units-component");
const standardRule_1 = require("./../../standardRule");
const position_1 = require("./position");
const configs_1 = require("./configs");
class OrdersComponent extends standardRule_1.standardRule.OrdersComponent {
    constructor() {
        super(...arguments);
        this.colors = configs_1.colors;
        this.size = configs_1.size;
        this.Unit = units_component_1.UnitComponent;
    }
    locationPositionOf(location, isDislodged) {
        return position_1.locationPositionOf(location, isDislodged);
    }
    provincePositionOf(province) {
        return position_1.provincePositionOf(province);
    }
}
exports.OrdersComponent = OrdersComponent;

//# sourceMappingURL=orders-component.js.map
