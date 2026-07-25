/// <reference types="react" />
import * as React from "react";
import * as diplomacy from "js-diplomacy";
import { EventTarget } from "./event-target";
import * as Svg from "./util";
import { BoardComponentProps } from "./board-component";
export declare namespace standardRule {
    interface ProvinceWithStatus<Power> {
        province: diplomacy.board.Province<Power>;
        status: diplomacy.standardRule.ProvinceStatus<Power> | null;
    }
    interface MapComponentProps<Power> {
        map: diplomacy.standardRule.DiplomacyMap<Power>;
        provinces: Set<ProvinceWithStatus<Power>>;
        on?: (event: EventTarget, province: diplomacy.board.Province<Power>) => void;
    }
    type MapComponent<Power> = React.Component<MapComponentProps<Power>, {}>;
    type StateComponent = React.Component<{
        state: diplomacy.standardRule.State;
    }, {}>;
    interface OrdersIconColors {
        fill: string;
        margin: string;
        border: string;
        dislodged: string;
    }
    interface OrdersIconSize {
        unitRadius: number;
        strokeWidth: number;
        marginStrokeWidth: number;
        arrowHeadLength: number;
    }
    interface OrdersComponentProps<Power> {
        orders: Set<diplomacy.standardRule.Order.Order<Power>>;
    }
    abstract class OrdersComponent<Power> extends React.Component<OrdersComponentProps<Power>, {}> {
        render(): JSX.Element;
        protected abstract Unit: new (props: UnitProps<Power>) => React.Component<UnitProps<Power>, {}>;
        protected abstract colors: OrdersIconColors;
        protected abstract size: OrdersIconSize;
        protected abstract provincePositionOf(province: diplomacy.board.Province<Power>): Svg.Point;
        protected abstract locationPositionOf(location: diplomacy.standardRule.Location<Power>, isDislodged: boolean): Svg.Point;
    }
    interface UnitWithStatus<Power> {
        unit: diplomacy.standardRule.Unit<Power>;
        status: diplomacy.standardRule.Dislodged<Power> | null;
    }
    interface UnitProps<Power> {
        unit: UnitWithStatus<Power>;
        on?: (event: EventTarget) => void;
    }
    interface UnitsComponentProps<Power> {
        units: Set<UnitWithStatus<Power>>;
        on?: (event: EventTarget, unit: diplomacy.standardRule.Unit<Power>) => void;
    }
    type UnitsComponent<Power> = React.Component<UnitsComponentProps<Power>, {}>;
    abstract class BoardComponent<Power> extends React.Component<BoardComponentProps<Power, diplomacy.standardRule.MilitaryBranch, diplomacy.standardRule.State, diplomacy.standardRule.Dislodged<Power>, diplomacy.standardRule.ProvinceStatus<Power>>, {}> {
        render(): JSX.Element;
        componentDidMount(): void;
        protected abstract MapComponent: new (props: MapComponentProps<Power>) => MapComponent<Power>;
        protected abstract UnitsComponent: new (props: UnitsComponentProps<Power>) => UnitsComponent<Power>;
        protected abstract OrdersComponent: new (props: OrdersComponentProps<Power>) => OrdersComponent<Power>;
        protected abstract StateComponent: new (props: {
            state: diplomacy.standardRule.State;
        }) => StateComponent;
        protected abstract width: number;
        protected abstract height: number;
    }
}
