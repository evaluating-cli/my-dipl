/// <reference types="react" />
import * as React from "react";
import * as diplomacy from "js-diplomacy";
import { standardRule } from "../../standardRule";
import * as Svg from "../../util";
export interface UnitImageColors<Power> {
    power(power: Power): string;
    fill: string;
    border: string;
    dislodged: string;
}
export interface UnitImageSize {
    unitRadius: number;
    strokeWidth: number;
}
export declare abstract class UnitImage<Power> extends React.Component<standardRule.UnitProps<Power>, {}> {
    render(): JSX.Element | null;
    protected abstract locationPositionOf(location: diplomacy.standardRule.Location<Power>, isDislodged: boolean): Svg.Point;
    protected abstract provincePositionOf(province: diplomacy.board.Province<Power>): Svg.Point;
    protected abstract colors: UnitImageColors<Power>;
    protected abstract size: UnitImageSize;
}
