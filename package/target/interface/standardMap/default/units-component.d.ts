/// <reference types="react" />
import * as React from "react";
import * as diplomacy from "js-diplomacy";
import { standardRule } from "../../standardRule";
import { UnitImageColors, UnitImage } from "./unit-image";
import { Point } from "../../util";
export declare class UnitComponent extends UnitImage<diplomacy.standardMap.Power> {
    protected locationPositionOf(location: diplomacy.standardRule.Location<diplomacy.standardMap.Power>, isDislodged: boolean): Point;
    protected provincePositionOf(province: diplomacy.board.Province<diplomacy.standardMap.Power>): Point;
    protected colors: UnitImageColors<diplomacy.standardMap.Power>;
    protected size: {
        unitRadius: number;
        arrowHeadLength: number;
        marginStrokeWidth: number;
        strokeWidth: number;
        standoffRadius: number;
        standoffWidth: number;
        standoffMarginWidth: number;
    };
}
export declare class UnitsComponent extends React.Component<standardRule.UnitsComponentProps<diplomacy.standardMap.Power>, {}> {
    render(): JSX.Element;
    Unit: typeof UnitComponent;
}
