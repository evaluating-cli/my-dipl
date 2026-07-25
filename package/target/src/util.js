"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
class ArrowHead extends React.Component {
    render() {
        const theta = Math.atan2(this.props.dest.x - this.props.src.x, this.props.dest.y - this.props.src.y) * 180 / Math.PI;
        const l = Math.sqrt((this.props.dest.x - this.props.src.x) * (this.props.dest.x - this.props.src.x) +
            (this.props.dest.y - this.props.src.y) * (this.props.dest.y - this.props.src.y));
        const destX = this.props.headLength * Math.tan(30 / 180 * Math.PI);
        return React.createElement("polygon", { points: `-${destX},${l - this.props.headLength} 0,${l} ${destX},${l - this.props.headLength}`, fill: this.props.fillColor, stroke: this.props.strokeColor, strokeWidth: this.props.strokeWidth, transform: `translate(${this.props.src.x}, ${this.props.src.y}), rotate(${-theta})` });
    }
}
exports.ArrowHead = ArrowHead;
class Circle extends React.Component {
    render() {
        return React.createElement("circle", { cx: this.props.center.x, cy: this.props.center.y, r: this.props.r, strokeWidth: this.props.strokeWidth, fill: this.props.fill, stroke: this.props.stroke });
    }
}
exports.Circle = Circle;
class Line extends React.Component {
    render() {
        if (this.props.ctrl) {
            return React.createElement("path", { d: `M ${this.props.from.x}, ${this.props.from.y} Q ${this.props.ctrl.x} ${this.props.ctrl.y} ${this.props.dest.x}, ${this.props.dest.y}`, stroke: this.props.stroke, strokeWidth: this.props.strokeWidth, fill: "none", strokeDasharray: this.props.strokeDasharray });
        }
        else {
            return React.createElement("path", { d: `M ${this.props.from.x}, ${this.props.from.y} ${this.props.dest.x}, ${this.props.dest.y}`, stroke: this.props.stroke, strokeWidth: this.props.strokeWidth, fill: "none", strokeDasharray: this.props.strokeDasharray });
        }
    }
}
exports.Line = Line;

//# sourceMappingURL=util.js.map
