import * as diplomacy from "js-diplomacy";
import { standardRule } from "./../../standardRule";
import { MapComponent } from "./map-component";
import { UnitsComponent } from "./units-component";
import { OrdersComponent } from "./orders-component";
import { StateComponent } from "./state-component";
export declare class BoardComponent extends standardRule.BoardComponent<diplomacy.standardMap.Power> {
    protected MapComponent: typeof MapComponent;
    protected UnitsComponent: typeof UnitsComponent;
    protected OrdersComponent: typeof OrdersComponent;
    protected StateComponent: typeof StateComponent;
    protected width: number;
    protected height: number;
}
