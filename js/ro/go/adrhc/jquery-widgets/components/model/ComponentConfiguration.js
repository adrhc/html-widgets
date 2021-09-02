/**
 * This is the component's configuration which could be constructed from HTML data-* values.
 * All data-* properties should be declared as fields otherwise they'll be ignored!
 *
 * @typedef {ComponentConfiguration} C
 */
class ComponentConfiguration {
    /**
     * @type {boolean|undefined}
     */
    dontConfigEventsOnError;
    /**
     * @type {boolean|undefined}
     */
    dontAutoInitialize;
    /**
     * @type {boolean|undefined}
     */
    dontReloadFromState;
    /**
     * @type {boolean|undefined}
     */
    clearChildrenOnReset;
    /**
     * @type {boolean|undefined}
     */
    updateViewOnce;
    /**
     * @type {boolean|undefined}
     */
    skipOwnViewUpdates;
    /**
     * @type {string|undefined}
     */
    childProperty;
    /**
     * @type {string|undefined}
     */
    elemIdOrJQuery;

    constructor(dataAttributes) {
        Object.assign(this, dataAttributes);
    }

    /**
     * Create a new ComponentConfiguration initialized with data-*, then {elemIdOrJQuery} and then ...firstWinDefaults.
     *
     * @param {string|jQuery<HTMLElement>|function(): jQuery<HTMLElement>} elemIdOrJQuery
     * @param {Object=} firstWinDefaults are applied from left to right (first applied wins)
     * @return {C}
     */
    static configWithDataAttributesOf(elemIdOrJQuery, ...firstWinDefaults) {
        const defaults = _.defaults({}, DomUtils.dataOf(elemIdOrJQuery), {elemIdOrJQuery}, ...firstWinDefaults);
        Object.assign(new ComponentConfiguration(), defaults);
    }

    /**
     * @param {boolean=} value
     * @param {boolean=} immutableOperation
     * @return {C}
     */
    dontAutoInitializeOf(value = true, immutableOperation = true) {
        const object = immutableOperation ? Object.assign(this._newOfSelfClass(), this) : this;
        object.dontAutoInitialize = value;
        return object;
    }

    /**
     * @return {C}
     * @protected
     */
    _newOfSelfClass() {
        const configClass = eval(this.constructor.name);
        return new configClass();
    }
}