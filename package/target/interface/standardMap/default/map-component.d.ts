/// <reference types="react" />
import * as React from "react";
import * as diplomacy from "js-diplomacy";
import { standardRule } from "../../standardRule";
import { Point } from "../../util";
export interface Colors<Power> {
    power(power: Power): string;
    neutralProvince: string;
    fill: string;
    border: string;
}
export interface Size {
    standoffRadius: number;
    standoffWidth: number;
    standoffMarginWidth: number;
}
export declare class MapComponent extends React.Component<standardRule.MapComponentProps<diplomacy.standardMap.Power>, {}> {
    render(): JSX.Element;
    componentDidMount(): void;
    componentDidUpdate(): void;
    private update();
    protected colors: Colors<diplomacy.standardMap.Power>;
    protected size: Size;
    protected positionOf(province: diplomacy.board.Province<diplomacy.standardMap.Power>): Point;
    protected provinceNameOf(province: diplomacy.board.Province<diplomacy.standardMap.Power>): string | null;
    protected locationNameOf(location: diplomacy.standardRule.Location<diplomacy.standardMap.Power>): string | null;
}
