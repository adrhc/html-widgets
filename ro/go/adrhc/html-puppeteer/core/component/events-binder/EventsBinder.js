import {dataOwnerSelectorOf, dataSelectorOf} from "../../../util/SelectorUtils.js";
import {isTrue} from "../../../util/AssertionUtils.js";

export default class EventsBinder {
    /**
     * @type {AbstractComponent}
     */
    _component;

    /**
     * The corresponding getter won't work in descendent classes!
     *
     * @param {AbstractComponent=} component
     */
    set component(component) {
        this._component = component;
    }

    /**
     * @param {AbstractComponent=} component
     */
    constructor(component) {
        this._component = component;
    }

    /**
     * attach DOM event handlers
     */
    attachEventHandlers() {}

    /**
     * detach DOM event handlers
     */
    detachEventHandlers() {}

    /**
     * @param {string} dataAttribName
     * @param {function} fn is the event handler
     * @param {boolean=} oneTimeOnly specify whether to invoke the event once or multiple times
     * @protected
     */
    _attachEventsHandlerOnOwnedHavingDataAttr(dataAttribName, fn, oneTimeOnly) {
        const $el = this._$ownedHavingDataAttr(dataAttribName);
        if (!$el.length) {
            return;
        }
        const event = $el.data(dataAttribName);
        isTrue(!!event, "[OpenCloseEventsBinder] event can't be empty!");
        // removing previous handler (if any) set by another component
        $el.off(event);
        $el[oneTimeOnly ? "one" : "on"](event, fn);
    }

    /**
     * @param {string} dataAttribName
     * @return {jQuery<HTMLElement>}
     * @protected
     */
    _$ownedHavingDataAttr(dataAttribName) {
        // [data-owner="componentId"][data-dataAttribName]
        return $(`${dataOwnerSelectorOf(this._component.id)}${dataSelectorOf(dataAttribName)}`);
    }
}