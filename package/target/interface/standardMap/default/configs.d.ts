import * as diplomacy from "js-diplomacy";
export declare type Power = diplomacy.standardMap.Power;
export declare class Colors {
    power(power: Power): "rgb(239, 154, 154)" | "rgb(206, 147, 216)" | "rgb(144, 202, 249)" | "rgb(150, 150, 150)" | "rgb(159, 168, 218)" | "rgb(255, 224, 130)" | "rgb(255, 171, 145)";
    neutralProvince: string;
    fill: string;
    border: string;
    dislodged: string;
    margin: string;
}
export declare const colors: Colors;
export declare const size: {
    unitRadius: number;
    arrowHeadLength: number;
    marginStrokeWidth: number;
    strokeWidth: number;
    standoffRadius: number;
    standoffWidth: number;
    standoffMarginWidth: number;
};
