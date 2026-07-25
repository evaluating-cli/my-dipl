"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const diplomacy = require("js-diplomacy");
const Season = diplomacy.standardBoard.Season;
const Phase = diplomacy.standardRule.Phase;
class StateComponent extends React.Component {
    render() {
        return React.createElement("g", null,
            React.createElement("rect", { x: "1", y: "1", height: "30", width: "250", fill: "white", stroke: "black", strokeWidth: "1" }),
            React.createElement("text", { y: "20", x: "10", style: {
                    fontStyle: "normal",
                    fontVariant: "normal",
                    fontWeight: "bold",
                    fontStretch: "normal",
                    fontSize: "16px",
                    fontFamily: "sans-serif",
                    letterSpacing: "0px",
                    wordSpacing: "0px",
                    display: "inline",
                    fill: "#000000",
                    fillOpacity: 1,
                    stroke: "#ffffff",
                    strokeWidth: 0.5,
                    strokeLinecap: "butt",
                    strokeLinejoin: "miter",
                    strokeMiterlimit: 4,
                    strokeDasharray: "none",
                    strokeOpacity: 1
                } },
                React.createElement("tspan", { y: "20", x: "5" }, this.stringify(this.props.state))));
    }
    stringify(state) {
        if (state.turn instanceof diplomacy.standardBoard.Turn) {
            return `${state.turn.year}-${Season[state.turn.season]} (${Phase[state.phase]})`;
        }
        else {
            return state.toString();
        }
    }
}
exports.StateComponent = StateComponent;

//# sourceMappingURL=state-component.js.map
