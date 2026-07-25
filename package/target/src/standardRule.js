"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const ReactDom = require("react-dom");
const diplomacy = require("js-diplomacy");
const Svg = require("./util");
var standardRule;
(function (standardRule) {
    class OrdersComponent extends React.Component {
        render() {
            const destPosition = (pos, theta, l) => {
                return {
                    x: pos.x + l * Math.cos(theta),
                    y: pos.y + l * Math.sin(theta)
                };
            };
            const orders = Array.from(this.props.orders).map(order => {
                const position = this.locationPositionOf(order.unit.location, order.tpe === diplomacy.standardRule.Order.OrderType.Retreat);
                if (order instanceof diplomacy.standardRule.Order.Hold) {
                    return React.createElement(Svg.Circle, { center: position, r: this.size.unitRadius, strokeWidth: this.size.strokeWidth, fill: "none", stroke: this.colors.fill, key: order.toString() });
                }
                if ((order instanceof diplomacy.standardRule.Order.Move) ||
                    (order instanceof diplomacy.standardRule.Order.Retreat)) {
                    const o = order;
                    const dest = this.locationPositionOf(o.destination, false);
                    const theta = Math.atan2(dest.y - position.y, dest.x - position.x);
                    const d = destPosition(dest, theta, -this.size.arrowHeadLength + this.size.marginStrokeWidth * 2);
                    return React.createElement("g", { key: o.toString() },
                        React.createElement(Svg.ArrowHead, { src: position, dest: dest, headLength: this.size.arrowHeadLength, strokeWidth: this.size.marginStrokeWidth, fillColor: this.colors.fill, strokeColor: this.colors.margin }),
                        React.createElement(Svg.Line, { from: position, dest: d, stroke: this.colors.margin, strokeWidth: this.size.strokeWidth + this.size.marginStrokeWidth * 2 }),
                        React.createElement(Svg.Line, { from: position, dest: d, stroke: this.colors.fill, strokeWidth: this.size.strokeWidth }));
                }
                if (order instanceof diplomacy.standardRule.Order.Support) {
                    const o = order;
                    const dest = this.locationPositionOf(o.destination, false);
                    if (o.target instanceof diplomacy.standardRule.Order.Move) {
                        const ctrl = this.locationPositionOf(o.target.unit.location, false);
                        const theta = Math.atan2(dest.y - ctrl.y, dest.x - ctrl.x);
                        const d = destPosition(dest, theta, -this.size.arrowHeadLength + this.size.marginStrokeWidth * 2);
                        return React.createElement("g", { key: o.toString() },
                            React.createElement(Svg.ArrowHead, { src: ctrl, dest: dest, headLength: this.size.arrowHeadLength, strokeWidth: this.size.marginStrokeWidth, fillColor: this.colors.fill, strokeColor: this.colors.margin }),
                            React.createElement(Svg.Line, { from: position, dest: d, ctrl: ctrl, stroke: this.colors.fill, strokeWidth: this.size.strokeWidth, strokeDasharray: "2, 2" }));
                    }
                    else if (o.target instanceof diplomacy.standardRule.Order.Hold) {
                        const theta = Math.atan2(dest.y - position.x, dest.x - position.x);
                        const d = destPosition(dest, theta, -this.size.arrowHeadLength + this.size.marginStrokeWidth * 2);
                        return React.createElement("g", { key: o.toString() },
                            React.createElement(Svg.ArrowHead, { src: position, dest: dest, headLength: this.size.arrowHeadLength, strokeWidth: this.size.marginStrokeWidth, fillColor: this.colors.fill, strokeColor: this.colors.margin }),
                            React.createElement(Svg.Line, { from: position, dest: d, stroke: this.colors.fill, strokeWidth: this.size.strokeWidth, strokeDasharray: "2, 2" }));
                    }
                }
                if (order instanceof diplomacy.standardRule.Order.Convoy) {
                    const o = order;
                    const dest = this.locationPositionOf(o.target.destination, false);
                    const from = this.locationPositionOf(o.target.unit.location, false);
                    const theta = Math.atan2(dest.y - from.y, dest.x - from.x);
                    const d = destPosition(dest, theta, -this.size.arrowHeadLength + this.size.marginStrokeWidth * 2);
                    return React.createElement("g", { key: o.toString() },
                        React.createElement(Svg.ArrowHead, { src: position, dest: dest, headLength: this.size.arrowHeadLength, strokeWidth: this.size.marginStrokeWidth, fillColor: this.colors.fill, strokeColor: this.colors.margin }),
                        React.createElement(Svg.Line, { from: from, dest: d, ctrl: position, stroke: this.colors.fill, strokeWidth: this.size.strokeWidth, strokeDasharray: "5, 2" }));
                }
                if (order instanceof diplomacy.standardRule.Order.Disband) {
                    const o = order;
                    const p2 = {
                        x: position.x - this.size.unitRadius * Math.cos(Math.PI / 4),
                        y: position.y - this.size.unitRadius * Math.sin(Math.PI / 4)
                    };
                    const p3 = {
                        x: position.x + this.size.unitRadius * Math.cos(Math.PI / 4),
                        y: position.y + this.size.unitRadius * Math.sin(Math.PI / 4)
                    };
                    return React.createElement(Svg.Line, { key: o.toString(), from: p2, dest: p3, stroke: this.colors.fill, strokeWidth: this.size.strokeWidth });
                }
                if (order instanceof diplomacy.standardRule.Order.Build) {
                    const o = order;
                    return React.createElement("g", { opacity: 0.5, key: o.toString() },
                        React.createElement(this.Unit, { unit: { unit: o.unit, status: null } }));
                }
            });
            return React.createElement("g", null, orders);
        }
    }
    standardRule.OrdersComponent = OrdersComponent;
    class BoardComponent extends React.Component {
        render() {
            const provinces = new Set(Array.from(this.props.board.map.provinces).map(province => {
                return {
                    province: province,
                    status: this.props.board.provinceStatuses.get(province) || null
                };
            }));
            const units = new Set(Array.from(this.props.board.units).map(unit => {
                return {
                    unit: unit,
                    status: this.props.board.unitStatuses.get(unit) || null
                };
            }));
            const orders = new Set(Array.from(this.props.orders)
                .filter(order => {
                return order instanceof diplomacy.standardRule.Order.Order;
            }));
            return React.createElement("svg", { width: `${this.width}px`, height: `${this.height}px` },
                React.createElement(this.MapComponent, { on: this.props.onProvince, map: this.props.board.map, provinces: provinces }),
                React.createElement(this.UnitsComponent, { on: this.props.onUnit, units: units }),
                React.createElement(this.OrdersComponent, { orders: orders }),
                React.createElement(this.StateComponent, { state: this.props.board.state }));
        }
        componentDidMount() {
            const svg = ReactDom.findDOMNode(this);
            if (svg.parentNode) {
                const adjust = () => {
                    const rect = svg.parentNode.getBoundingClientRect();
                    const wRatio = rect.width / this.width;
                    const hRatio = rect.height / this.height;
                    const ratio = Math.min(wRatio, hRatio);
                    svg.setAttribute("width", this.width * ratio + "px");
                    svg.setAttribute("height", this.height * ratio + "px");
                    svg.setAttribute("transform", `scale(${ratio})`);
                };
                svg.parentNode.addEventListener("resise", adjust);
                adjust();
            }
        }
    }
    standardRule.BoardComponent = BoardComponent;
})(standardRule = exports.standardRule || (exports.standardRule = {}));

//# sourceMappingURL=standardRule.js.map
