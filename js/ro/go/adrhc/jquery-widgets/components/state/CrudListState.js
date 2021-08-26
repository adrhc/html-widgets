/**
 * @typedef {EntityRow<IdentifiableEntity>} P
 * @extends {SimpleListState<IdentifiableEntity[], EntityRow<IdentifiableEntity>>}
 */
class CrudListState extends SimpleListState {
    /**
     * @type {function(): IdentifiableEntity}
     */
    newEntityFactoryFn;
    /**
     * whether to append or prepend new items
     *
     * @type {boolean}
     */
    append;

    /**
     * @param {IdentifiableEntity[]} [initialState]
     * @param {function(): IdentifiableEntity} [newEntityFactoryFn]
     * @param {boolean} [newItemsGoLast]
     * @param {TaggingStateChangeMapper<IdentifiableEntity[]>} [stateChangeMapper]
     * @param {StateChangesCollector<IdentifiableEntity[]>} [changeManager]
     */
    constructor({
                    initialState,
                    newEntityFactoryFn = () => new IdentifiableEntity(IdentifiableEntity.TRANSIENT_ID),
                    newItemsGoLast,
                    stateChangeMapper,
                    changeManager
                }) {
        super({initialState, stateChangeMapper, changeManager});
        this.newEntityFactoryFn = newEntityFactoryFn;
        this.append = newItemsGoLast;
    }

    /**
     * @param {number} index
     * @return {EntityRow<IdentifiableEntity>|undefined}
     */
    getStatePart(index) {
        if (this.items == null || index < 0 || index >= this.items.length) {
            return undefined;
        }
        const item = this.items[index];
        return item == null ? undefined : new EntityRow(item, {index});
    }

    /**
     * @param {EntityRow<IdentifiableEntity>} newRowValues
     * @param {number} oldIndex
     * @return {boolean}
     * @protected
     */
    _currentStatePartEquals(newRowValues, oldIndex) {
        const isPrevNullOrMissing = oldIndex >= this.items.length ||
            oldIndex < this.items.length && this.items[oldIndex] == null;
        const bothNewAndPrevAreNull = newRowValues == null && isPrevNullOrMissing;
        return bothNewAndPrevAreNull ||
            !isPrevNullOrMissing && newRowValues != null &&
            newRowValues.index === oldIndex &&
            this.items[oldIndex] === newRowValues.entity;
    }

    /**
     * @param {EntityRow<IdentifiableEntity>} newRowValues
     * @param {number} oldIndex
     * @return {EntityRow<IdentifiableEntity>} previous state part
     * @protected
     */
    _replacePartImpl(newRowValues, oldIndex) {
        const oldRowValues = this.getStatePart(oldIndex);
        if (oldRowValues == null) {
            if (newRowValues == null) {
                // both old and new item are null, nothing else to do
                return oldRowValues;
            }
            // old item doesn't exists, inserting the new one
            this._insertEntityRow(newRowValues);
        } else if (newRowValues == null) {
            // old item exists but the new one is null (i.e. old is deleted)
            ArrayUtils.removeByIndex(oldIndex, this.items);
        } else if (newRowValues.index === oldIndex) {
            // the index is the same, only changing the value at that index
            this.items[oldIndex] = newRowValues.entity;
        } else {
            // both item's value and index changed
            ArrayUtils.removeByIndex(oldIndex, this.items);
            this._insertEntityRow(newRowValues);
        }
        return oldRowValues;
    }

    /**
     * @param {EntityRow<IdentifiableEntity>} entityRow
     * @protected
     */
    _insertEntityRow(entityRow) {
        if (entityRow.index != null) {
            if (entityRow.index === TableElementAdapter.LAST_ROW_INDEX) {
                this.items.push(entityRow.entity);
            } else {
                ArrayUtils.insert(entityRow.entity, entityRow.index, this.items);
            }
        } else if (entityRow.beforeRowId != null) {
            const index = this.findIndexById(entityRow.beforeRowId);
            ArrayUtils.insert(entityRow.entity, index, this.items);
        } else if (entityRow.afterRowId != null) {
            const index = this.findIndexById(entityRow.afterRowId);
            ArrayUtils.insert(entityRow.entity, index + 1, this.items);
        } else if (entityRow.append === true) {
            this.items.push(entityRow.entity);
        } else {
            ArrayUtils.insert(entityRow.entity, 0, this.items);
        }
    }

    /**
     * @param {EntityRow<IdentifiableEntity>=} previousStatePart
     * @param {EntityRow<IdentifiableEntity>=} partialState
     * @param {string|number=} oldPartName
     * @return {StateChange<EntityRow<IdentifiableEntity>>|undefined}
     * @protected
     */
    _stateChangeOf(previousStatePart, partialState, oldPartName) {
        AssertionUtils.isTrue(previousStatePart != null || partialState != null);
        // when partialState is empty than previousStatePart should not be empty
        const newPosition = partialState?.entity != null ? this.indexOf(partialState?.entity) : undefined;
        // oldPartName would depend on previousStatePart if not empty and fallback to partialState
        return super._stateChangeOf(previousStatePart, partialState,
            oldPartName ?? previousStatePart?.index ?? partialState?.index ?? newPosition);
    }

    /**
     * must return the original item (the one stored in this.items) for the receiver to be able to change its id
     * risk: the item is also used with the collectStateChange; a change by the final receiver will impact this.items!
     *
     * @param {IdentifiableEntity|{}} [initialValue]
     * @param {{index?: number, beforeRowId?: number, afterRowId?: number, append?: boolean}} options
     * @return {TaggedStateChange<EntityRow<IdentifiableEntity>>}
     */
    createNewItem(initialValue, options = {}) {
        const item = this.newEntityFactoryFn();
        if (initialValue != null) {
            $.extend(item, initialValue);
        }
        return this.insertItem(item, options);
    }

    /**
     * @param {IdentifiableEntity} item
     * @param {{previousItemId?: number|string, index?: number, beforeRowId?: number, afterRowId?: number, append?: boolean}} options
     * @return {TaggedStateChange<EntityRow<IdentifiableEntity>>}
     */
    createOrUpdate(item, options = {}) {
        if (options.previousItemId != null && item.id != null
            && !EntityUtils.idsAreEqual(item.id, options.previousItemId)) {
            // item acquired a new id, removing the previous version having options.previousItemId
            this.removeById(options.previousItemId);
        }
        if (this.findById(item.id)) {
            return this.updateItem(item, options);
        } else {
            return this.createNewItem(item, options)
        }
    }

    /**
     * @param {IdentifiableEntity} item
     * @param {{index?: number, beforeRowId?: number, afterRowId?: number, append?: boolean}} options
     * @return {TaggedStateChange<EntityRow<IdentifiableEntity>>}
     */
    insertItem(item, options = {}) {
        options.append = options.append ?? this.append;
        return this._replaceItem(new EntityRow(item, options));
    }

    indexOf(item) {
        return this.items.indexOf(item);
    }

    /**
     * @param {IdentifiableEntity} item
     * @param {{previousIndex?: number, index?: number, beforeRowId?: number, afterRowId?: number, append?: boolean}} options
     * @return {TaggedStateChange<EntityRow<IdentifiableEntity>>}
     */
    updateItem(item, options = {}) {
        const previousIndex = options.previousIndex ?? this.findIndexById(item.id);
        options.index = options.index ?? previousIndex;
        return this._replaceItem(new EntityRow(item, options), previousIndex);
    }

    /**
     * @return {TaggedStateChange<EntityRow<IdentifiableEntity>>}
     */
    removeTransient() {
        return this.removeById(IdentifiableEntity.TRANSIENT_ID);
    }

    /**
     * @param {number|string} id
     * @return {TaggedStateChange<EntityRow<IdentifiableEntity>>}
     */
    removeById(id) {
        const indexToRemove = this.findIndexById(id);
        return this._removeItem(indexToRemove);
    }

    /**
     * @param {number} index
     * @return {TaggedStateChange<EntityRow<IdentifiableEntity>>}
     * @protected
     */
    _removeItem(index) {
        return this.replacePart(undefined, index);
    }

    /**
     * @param {EntityRow<IdentifiableEntity>} rowValues
     * @param {number} [oldIndex]
     * @return {TaggedStateChange<EntityRow<IdentifiableEntity>>}
     * @protected
     */
    _replaceItem(rowValues, oldIndex = rowValues.index) {
        return this.replacePart(rowValues, oldIndex);
    }

    /**
     * @param {number|string} id
     * @return {number}
     */
    findIndexById(id) {
        return EntityUtils.findIndexById(id, this.items);
    }

    /**
     * @param {string|number} id
     * @return {IdentifiableEntity}
     */
    findById(id) {
        return EntityUtils.findById(id, this.items);
    }
}