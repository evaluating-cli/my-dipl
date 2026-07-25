import * as diplomacy from "js-diplomacy";
import { UnitComponent } from "./units-component";
import { standardRule } from "./../../standardRule";
import { Point } from "../../util";
export declare class OrdersComponent extends standardRule.OrdersComponent<diplomacy.standardMap.Power> {
    protected locationPositionOf(location: diplomacy.standardRule.Location<diplomacy.standardMap.Power>, isDislodged: boolean): Point;
    protected provincePositionOf(province: diplomacy.board.Province<diplomacy.standardMap.Power>): Point;
    protected colors: standardRule.OrdersIconColors;
    protected size: {
        unitRadius: number;
        arrowHeadLength: number;
        marginStrokeWidth: number;
        strokeWidth: number;
        standoffRadius: number;
        standoffWidth: number;
        standoffMarginWidth: number;
    };
    protected Unit: typeof UnitComponent;
}
