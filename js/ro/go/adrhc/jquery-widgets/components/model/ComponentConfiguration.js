class ComponentConfiguration {
    /**
     * @type {boolean}
     */
    dontConfigEventsOnError;
    /**
     * @type {boolean}
     */
    dontAutoInitialize;
    /**
     * @type {boolean}
     */
    dontReloadFromState;
    /**
     * @type {boolean}
     */
    clearChildrenOnReset;
    /**
     * @type {boolean}
     */
    updateViewOnce;
    /**
     * @type {boolean}
     */
    skipOwnViewUpdates;
    /**
     * @type {string}
     */
    childProperty;

    constructor({
                    dontConfigEventsOnError,
                    dontAutoInitialize,
                    dontReloadFromState,
                    clearChildrenOnReset,
                    updateViewOnce,
                    skipOwnViewUpdates,
                    childProperty
                } = {}) {
        this.dontConfigEventsOnError = dontConfigEventsOnError;
        this.dontAutoInitialize = dontAutoInitialize;
        this.dontReloadFromState = dontReloadFromState;
        this.clearChildrenOnReset = clearChildrenOnReset;
        this.updateViewOnce = updateViewOnce;
        this.skipOwnViewUpdates = skipOwnViewUpdates;
        this.childProperty = childProperty;
    }

    /**
     * @param {string|jQuery<HTMLElement>|function(): jQuery<HTMLElement>} elemIdOrJQuery
     * @param {Object=} defaults are applied from left to right (last applied wins)
     * @return {ComponentConfiguration}
     */
    static configOf(elemIdOrJQuery, ...defaults) {
        // return _.defaults(new ComponentConfiguration(), ...sources, DomUtils.dataOf(elemIdOrJQuery));
        // return Object.assign(new ComponentConfiguration(), _.defaultsAll([{}, ...sources, DomUtils.dataOf(elemIdOrJQuery)]));
        return $.extend(new ComponentConfiguration(), ...defaults, DomUtils.dataOf(elemIdOrJQuery));
    }

    static configWithOverrides(elemIdOrJQuery, ...overrides) {
        return ComponentConfiguration.configOf(elemIdOrJQuery).overwriteWith(...overrides);
    }

    /**
     * @param {Object} overwrites
     * @return {ComponentConfiguration}
     */
    overwriteWith(...overwrites) {
        return $.extend(new ComponentConfiguration(), this, ...overwrites);
    }

    /**
     * @param {boolean=} dontAutoInitialize
     * @return {ComponentConfiguration}
     */
    dontAutoInitializeOf(dontAutoInitialize = true) {
        return this.overwriteWith({dontAutoInitialize});
    }
}