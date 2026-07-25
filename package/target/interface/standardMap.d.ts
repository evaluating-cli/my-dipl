import * as UnitImageModule from "./standardMap/default/unit-image";
import * as BoardComponentModule from "./standardMap/default/board-component";
export declare namespace standardMap {
    abstract class UnitImage<Power> extends UnitImageModule.UnitImage<Power> {
    }
    class BoardComponent extends BoardComponentModule.BoardComponent {
    }
}
