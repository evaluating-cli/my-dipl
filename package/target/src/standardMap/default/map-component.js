"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const ReactDOM = require("react-dom");
const event_target_1 = require("../../event-target");
const map_image_1 = require("./map-image");
const position_1 = require("./position");
const configs_1 = require("./configs");
class MapComponent extends React.Component {
    constructor() {
        super(...arguments);
        this.colors = configs_1.colors;
        this.size = configs_1.size;
    }
    render() {
        // Render standoff markers
        const standoffs = Array.from(this.props.provinces).map(elem => {
            if (elem.status && elem.status.standoff) {
                const { x, y } = this.positionOf(elem.province);
                const s = this.size.standoffWidth / 2;
                const r = this.size.standoffRadius;
                return React.createElement("polygon", { points: `${s},${r} ${s},${s} ${r},${s} ${r},${-s} ${s},${-s} ${s},${-r} ` +
                        `${-s},${-r} ${-s},${-s} ${-r},${-s} ${-r},${s} ${-s},${s} ${-s},${r}`, stroke: this.colors.border || undefined, strokeWidth: this.size.standoffMarginWidth || undefined, fill: this.colors.fill || undefined, transform: `translate(${x}, ${y}, rotate(45))` });
            }
            else {
                return null;
            }
        }).filter(x => x !== null);
        return React.createElement("g", null,
            React.createElement(map_image_1.MapImage, null),
            standoffs);
    }
    componentDidMount() {
        this.update();
    }
    componentDidUpdate() {
        this.update();
    }
    update() {
        const map = ReactDOM.findDOMNode(this);
        /* Render province informations */
        // Supply centers
        this.props.map.provinces.forEach(province => {
            const tgt = map.querySelector(`.supply_center.${province.name}`);
            if (!tgt)
                throw province.toString();
            if (province.isSupplyCenter) {
                tgt.style.display = "";
            }
            else {
                tgt.style.display = "none";
            }
        });
        // name
        this.props.map.locations.forEach(location => {
            const name = this.locationNameOf(location);
            if (name) {
                const tgt = map.querySelector(`.locaton_name.${location.name}`);
                if (tgt) {
                    tgt.innerHTML = name;
                }
            }
        });
        this.props.map.provinces.forEach(province => {
            const name = this.provinceNameOf(province);
            if (name) {
                const tgt = map.querySelector(`.name.${province.name}`);
                if (tgt) {
                    tgt.innerHTML = name;
                }
            }
        });
        // occupied
        this.props.provinces.forEach(elem => {
            const province = elem.province;
            const color = (elem.status && elem.status.occupied)
                ? this.colors.power(elem.status.occupied)
                : this.colors.neutralProvince;
            const tgt = map.querySelector(`.${province.name}`);
            if (tgt && !(tgt.classList.contains("fix-color"))) {
                tgt.style.fill = color;
                tgt.style.stroke = color;
            }
        });
        // Add eventlistener
        this.props.map.provinces.forEach(province => {
            Array.from(map.querySelectorAll(`.${province.name}`)).forEach(dom => {
                dom.addEventListener('click', () => {
                    if (this.props.on) {
                        this.props.on(event_target_1.EventTarget.click, province);
                    }
                });
                dom.addEventListener('dblclick', () => {
                    if (this.props.on) {
                        this.props.on(event_target_1.EventTarget.dblclick, province);
                    }
                });
                dom.addEventListener('mousedown', () => {
                    if (this.props.on) {
                        this.props.on(event_target_1.EventTarget.mousedown, province);
                    }
                });
                dom.addEventListener('mouseup', () => {
                    if (this.props.on) {
                        this.props.on(event_target_1.EventTarget.mouseup, province);
                    }
                });
            });
        });
    }
    positionOf(province) {
        return position_1.provincePositionOf(province);
    }
    provinceNameOf(province) {
        return null;
    }
    locationNameOf(location) {
        return null;
    }
}
exports.MapComponent = MapComponent;

//# sourceMappingURL=map-component.js.map
