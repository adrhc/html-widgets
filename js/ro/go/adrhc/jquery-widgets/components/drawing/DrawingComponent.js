class DrawingComponent extends ContainerComponent {
    /**
     * @param {string|jQuery<HTMLElement} elemIdOrJQuery
     * @param {ComponentConfiguration} [config]
     * @param {ContainerStateHolder} [state]
     * @param {DefaultTemplatingView} [view]
     */
    constructor(elemIdOrJQuery,
                config = ComponentConfiguration.configOf(elemIdOrJQuery),
                state, view) {
        super(elemIdOrJQuery, config);
        config.clearChildrenOnReset = _.defaultTo(true, config.clearChildrenOnReset)
    }

    /**
     * @param {*} stateOrPart
     * @param {string|number} [partName]
     * @param {boolean} [dontRecordStateEvents]
     * @return {Promise<StateChange[]>}
     */
    resetThenUpdate(stateOrPart, {partName, dontRecordStateEvents} = {}) {
        this.reset();
        this.runtimeConfig.skipOwnViewUpdates = false;
        return super.update(stateOrPart, {partName, dontRecordStateEvents});
    }

    update(stateOrPart, {partName, dontRecordStateEvents} = {}) {
        return this.resetThenUpdate(stateOrPart, {partName, dontRecordStateEvents});
    }
}