class EditableListComponent extends SelectableListComponent {
    /**
     * @param repository {CrudRepository}
     * @param state {SelectableListState}
     * @param view {SimpleListView}
     * @param offRow {IdentifiableRowComponent}
     * @param onRow {IdentifiableRowComponent}
     * @param deletableRow {IdentifiableRowComponent}
     * @param [extractedEntityConverterFn] {function(extractedEntity: {}): IdentifiableEntity}
     * @param {ComponentConfiguration} [config]
     */
    constructor(repository, state, view,
                offRow, onRow,
                deletableRow,
                extractedEntityConverterFn, config) {
        super(repository, state, view, offRow, onRow, config);
        this.swappingRowSelector["showAdd"] = onRow;
        this.swappingRowSelector["showEdit"] = onRow; // is equal to super.swappingRowSelector[false]
        this.swappingRowSelector["showDelete"] = deletableRow;
        if (extractedEntityConverterFn) {
            this.selectableListEntityExtractor.entityConverterFn = extractedEntityConverterFn;
        }
    }

    /**
     * SHOW DELETE OR UPDATE (aka EDIT)
     *
     * @param ev {Event}
     */
    onShowDU(ev) {
        /**
         * @type {EditableListComponent}
         */
        const editableList = ev.data;
        const rowDataId = editableList.simpleListView.rowDataIdOf(this, true);
        const context = $(this).data("btn");
        if (!rowDataId || !context) {
            return;
        }
        ev.stopPropagation();
        // "showEdit" row component should be the same used for row double-click in SelectableListComponent (i.e. undefined)
        // context could be "showEdit" or "showDelete"
        editableList.switchTo(rowDataId, context);
    }

    /**
     * SHOW ADD
     *
     * @param ev
     */
    onShowAdd(ev) {
        ev.stopPropagation();
        /**
         * @type {EditableListComponent}
         */
        const editableList = ev.data;
        editableList.doWithState((state) => {
            const selectableListState = editableList.castState(state);
            if (selectableListState.findById(IdentifiableEntity.TRANSIENT_ID)) {
                // new item already exists, do nothing
                return;
            }
            // todo: correlate "append" createNewItem param with showAdd.tableRelativePositionOnCreate
            // events: CREATE
            const newId = selectableListState.createNewItem().id;
            // events: SWAP (isPrevious=true, if any previous exists) + SWAP (isPrevious=false)
            selectableListState.switchTo(newId, "showAdd");
        });
    }

    /**
     * CANCEL
     *
     * @param ev {Event}
     */
    onCancel(ev) {
        ev.stopPropagation();
        /**
         * @type {EditableListComponent}
         */
        const editableList = ev.data;
        return editableList.doWithState(state => {
            const selectableListState = editableList.castState(state);
            selectableListState.switchToOff();
        });
    }

    /**
     * DELETE
     *
     * @param ev {Event}
     */
    onDelete(ev) {
        ev.stopPropagation();
        /**
         * @type {EditableListComponent}
         */
        const editableList = ev.data;
        const rowDataId = editableList.simpleListView.rowDataIdOf(this, true);
        editableList._handleRepoErrors(editableList.repository.delete(rowDataId)
            .then(() =>
                editableList.doWithState((state) => {
                    const selectableListState = editableList.castState(state);
                    selectableListState.switchToOff();
                    selectableListState.removeById(rowDataId);
                })));
    }

    /**
     * UPDATE
     *
     * @param ev {Event}
     */
    onUpdate(ev) {
        ev.stopPropagation();
        /**
         * @type {EditableListComponent}
         */
        const editableList = ev.data;
        const rowDataId = editableList.simpleListView.rowDataIdOf(this, true);
        let entity = editableList.extractEntity();
        editableList._handleRepoErrors(editableList.repository.save(entity)
            .then(savedEntity =>
                editableList.doWithState((state) => {
                    const selectableListState = editableList.castState(state);
                    // events: SWAP (isPrevious=true, if any previous exists) + DELETE (transient, if any)
                    selectableListState.switchToOff();
                    // todo: sync "append" save param with offRow.tableRelativePositionOnCreate
                    // events: DELETE (transient, if any) + CREATE or just UPDATE
                    console.log(`${this.constructor.name}.onUpdate, savedEntity:\n${JSON.stringify(savedEntity)}`);
                    selectableListState.save(savedEntity, rowDataId);
                }))
            .catch((simpleError) => {
                return editableList.selectedRowComponent.doWithState((state) => {
                    state.collectFromSimpleError(simpleError, "UPDATE_OR_CREATE", entity);
                });
            }));
    }

    /**
     * linking triggers to component's handlers (aka capabilities)
     *
     * @protected
     */
    _configureEvents() {
        super._configureEvents();
        this.simpleListView.$elem
            .on(this._appendNamespaceTo('click'),
                `${this._btnSelector(['showDelete', 'showEdit'])}`, this, this.onShowDU)
            .on(this._appendNamespaceTo('click'),
                `${this._ownerSelector}[data-btn='showAdd']`, this, this.onShowAdd)
            .on(this._appendNamespaceTo('click'),
                `${this._ownerSelector}[data-btn='cancel']`, this, this.onCancel)
            .on(this._appendNamespaceTo('click'),
                `${this._ownerSelector}[data-btn='delete']`, this, this.onDelete)
            .on(this._appendNamespaceTo('click'),
                `${this._ownerSelector}[data-btn='update']`, this, this.onUpdate);
    }

    reset() {
        super.reset();
        this._resetSwappingRowSelector();
    }

    /**
     * @protected
     */
    _resetSwappingRowSelector() {
        for (let key in this.swappingRowSelector) {
            this.swappingRowSelector[key].reset();
        }
    }
}