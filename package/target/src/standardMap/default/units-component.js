"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const unit_image_1 = require("./unit-image");
const position_1 = require("./position");
const configs_1 = require("./configs");
class UnitComponent extends unit_image_1.UnitImage {
    constructor() {
        super(...arguments);
        this.colors = configs_1.colors;
        this.size = configs_1.size;
    }
    locationPositionOf(location, isDislodged) {
        return position_1.locationPositionOf(location, isDislodged);
    }
    provincePositionOf(province) {
        return position_1.provincePositionOf(province);
    }
}
exports.UnitComponent = UnitComponent;
class UnitsComponent extends React.Component {
    constructor() {
        super(...arguments);
        this.Unit = UnitComponent;
    }
    render() {
        const units = Array.from(this.props.units)
            .filter(unit => unit.status === null)
            .map(elem => {
            const unit = elem.unit;
            return React.createElement(this.Unit, { key: unit.toString(), unit: elem, on: (event) => {
                    if (this.props.on) {
                        this.props.on(event, unit);
                    }
                } });
        });
        const dislodgedUnits = Array.from(this.props.units)
            .filter(unit => unit.status !== null)
            .map(elem => {
            const unit = elem.unit;
            return React.createElement(this.Unit, { key: `${unit}-dislodged}`, unit: elem, on: (event) => {
                    if (this.props.on) {
                        this.props.on(event, unit);
                    }
                } });
        });
        return React.createElement("g", null,
            units,
            dislodgedUnits);
    }
}
exports.UnitsComponent = UnitsComponent;

//# sourceMappingURL=units-component.js.map
