class DynamicSelectOneComponent extends AbstractComponent {
    /**
     * @param view {DynamicSelectOneView}
     * @param state {DynaSelOneState}
     * @param [focusOnInit] {boolean}
     */
    constructor(view, state, {focusOnInit}) {
        // todo: adapt DynamicSelectOneView to BasicState
        super(state, view);
        this.dynaSelOneState = state;
        this.dynaSelOneView = view;
        this.focusOnInit = focusOnInit;
    }

    onOptionClick(ev) {
        ev.stopPropagation();
        if (ev.key !== "Enter" && ev.type !== "click") {
            return true;
        }
        const _this = ev.data;
        _this.dynaSelOneState.updateById($(this).val())
            .then(state => _this.updateView(state));
    }

    onKeyup(ev) {
        ev.stopPropagation();
        // console.log(ev);
        if (ev.key !== "Escape" && ev.key !== "Enter" && ev.type !== "blur") {
            // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
            return true;
        }
        const _this = ev.data;
        const command = ev.type !== "blur" ? ev.key : "Blur";
        _this[`_on${command}`]($(this).val());
    }

    _onEscape() {
        this.dynaSelOneState.updateByTitle().finally(() => this.updateView(this.state, true));
    }

    _onEnter(text) {
        this.dynaSelOneState.updateByTitle(text).then(state => this.updateView(state, true));
    }

    _onBlur(text) {
        this.dynaSelOneState.updateByTitle(text).then(state => this.updateView(state));
    }

    /**
     * @return {Promise<void>}
     */
    init() {
        this._clearOnBlurHandlers();
        return this.dynaSelOneView
            .update(this.dynaSelOneState, this.focusOnInit)
            .then(() => this._configureEvents());
    }

    updateView(state, focusOnSearchInput) {
        this._clearOnBlurHandlers();
        return this.dynaSelOneView
            .update(state, focusOnSearchInput)
            .then(() => this._configureOnBlur());
    }

    /**
     * linking "outside" (and/or default) triggers to component's handlers (aka capabilities)
     */
    _configureEvents() {
        const view = this.dynaSelOneView;
        const $comp = view.$elem;

        $comp.on(this._appendNamespaceTo('keyup'),
            `[name='${view.titleInputName}']`, this, this.onKeyup);
        // comp.on('keyup blur mouseleave', "[name='title']", this, this.onKeyup);
        // comp.find("[name='title']").on("keyup blur mouseleave", this, this.onKeyup);
        this._configureOnBlur();

        $comp.on(this._appendNamespaceTo(['click', 'keyup']),
            'option', this, this.onOptionClick);
        // comp.on('change.dyna-sel-one keyup.dyna-sel-one', "[name='options']", this, this.onOptionClick);
    }

    _configureOnBlur() {
        // from jquery docs: blur does not propagate
        this.dynaSelOneView.$titleElem[0].onblur = (ev) => {
            ev.data = this;
            this.onKeyup.bind(ev.target)(ev, true);
        };
        // console.log(`DynamicSelectOneComponent._configureOnBlur:\n${JSON.stringify(this.extractEntity())}`);
        // console.log("DynamicSelectOneComponent selectedItem:\n", this.dynaSelOneState.selectedItem);
    }

    _clearOnBlurHandlers() {
        this.view.$elem.off(this._appendNamespaceTo("blur"));
        const $searchInputElem = this.dynaSelOneView.$titleElem;
        if ($searchInputElem.length) {
            $searchInputElem[0].onblur = null;
        }
    }

    close() {
        this._clearOnBlurHandlers();
        super.close();
    }
}