/// <reference types="react" />
import * as React from "react";
export interface Point {
    x: number;
    y: number;
}
export interface ArrowHeadProps {
    src: Point;
    dest: Point;
    headLength: number;
    strokeWidth: number;
    fillColor: string;
    strokeColor: string;
}
export declare class ArrowHead extends React.Component<ArrowHeadProps, {}> {
    render(): JSX.Element;
}
export interface CircleProps {
    center: Point;
    r: number;
    strokeWidth: number;
    stroke: string;
    fill: string;
}
export declare class Circle extends React.Component<CircleProps, {}> {
    render(): JSX.Element;
}
export interface LineProps {
    from: Point;
    dest: Point;
    ctrl?: Point;
    strokeWidth: number;
    stroke: string;
    strokeDasharray?: string;
}
export declare class Line extends React.Component<LineProps, {}> {
    render(): JSX.Element;
}
