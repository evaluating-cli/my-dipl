/// <reference types="react" />
import * as React from "react";
import * as diplomacy from "js-diplomacy";
export declare class StateComponent extends React.Component<{
    state: diplomacy.standardRule.State;
}, {}> {
    render(): JSX.Element;
    protected stringify(state: diplomacy.standardRule.State): string;
}
