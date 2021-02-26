/**
 * A component rendering a table by using a list of items.
 * Updatable by a state change containing all items.
 */
class SimpleListComponent extends AbstractTableBasedComponent {
    /**
     * @param {CrudRepository} repository
     * @param {SimpleListState} state
     * @param {SimpleListView} view
     * @param {ComponentConfiguration} [config]
     */
    constructor(repository, state, view, config) {
        super(state, view, config);
        this.stateChangesDispatcher.prependKnownRequestTypes("CREATE", "REPLACE", "DELETE");
        this.simpleListState = state;
        this.repository = repository;
    }

    /**
     * @return {Promise<*>}
     */
    _reloadState() {
        return this._handleRepoErrors(this.repository.findAll())
            .then((items) => {
                console.log(`${this.constructor.name} items:\n`, JSON.stringify(items));
                // reset must be before updateAll because it resets the state too!
                this.reset();
                this.simpleListState.updateAll(items);
                return items;
            });
    }

    /**
     * Although very similar to init, reload is another scenario, that's why it's ok to have its own method.
     * On _reloadState error reset() won't happen that's why we have ComponentInitConfig(true).
     *
     * @return {Promise<StateChange[]>}
     * @protected
     */
    _reload() {
        return this.init(new ComponentInitConfig(true));
    }

    /**
     * RELOAD
     *
     * @param ev {Event}
     */
    onReload(ev) {
        ev.stopPropagation();
        /**
         * @type {SimpleListComponent}
         */
        const simpleListComponent = ev.data;
        simpleListComponent._reload();
    }

    /**
     * linking triggers to component's handlers (aka capabilities)
     *
     * @protected
     */
    configureEvents() {
        console.log(`${this.constructor.name}.configureEvents`);
        this.view.$elem.on(this._appendNamespaceTo("click"),
            this._btnSelector("reload"), this, this.onReload);
    }
}