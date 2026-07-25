"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const standardRule_1 = require("./../../standardRule");
const map_component_1 = require("./map-component");
const units_component_1 = require("./units-component");
const orders_component_1 = require("./orders-component");
const state_component_1 = require("./state-component");
class BoardComponent extends standardRule_1.standardRule.BoardComponent {
    constructor() {
        super(...arguments);
        this.MapComponent = map_component_1.MapComponent;
        this.UnitsComponent = units_component_1.UnitsComponent;
        this.OrdersComponent = orders_component_1.OrdersComponent;
        this.StateComponent = state_component_1.StateComponent;
        this.width = 900;
        this.height = 787;
    }
}
exports.BoardComponent = BoardComponent;

//# sourceMappingURL=board-component.js.map
