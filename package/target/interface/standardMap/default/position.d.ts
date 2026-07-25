import * as diplomacy from "js-diplomacy";
export declare function locationPositionOf(location: diplomacy.standardRule.Location<diplomacy.standardMap.Power>, isDislodged: boolean): {
    x: number;
    y: number;
};
export declare function provincePositionOf(province: diplomacy.board.Province<diplomacy.standardMap.Power>): {
    x: number;
    y: number;
};
