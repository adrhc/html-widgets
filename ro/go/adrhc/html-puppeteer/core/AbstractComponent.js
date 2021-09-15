import DefaultComponentConfigurer from "./DefaultComponentConfigurer.js";

/**
 * @typedef {Object} AbstractComponentOptions
 * @property {string=} elemIdOrJQuery
 * @property {StateHolder=} stateHolder
 * @property {StateInitializer=} stateInitializer
 * @property {*=} initialState
 * @property {StateChangesHandlerAdapter} stateChangesHandlerAdapter
 * @property {string=} allChangesMethod
 * @property {string=} allPartChangesMethod
 * @property {string=} partMethodPrefix
 * @property {StateChangesHandler[]} stateChangesHandlers
 * @property {ComponentIllustrator} componentIllustrator
 * @property {PartsAllocator} partsAllocator
 * @property {StateChangesHandler[]} extraStateChangesHandlers
 */
export default class AbstractComponent {
    /**
     * @type {StateChangesHandlerAdapter}
     */
    stateChangesHandlerAdapter;
    /**
     * @type {StateHolder}
     */
    stateHolder;
    /**
     * @type {StateInitializer}
     */
    stateInitializer;

    /**
     * @param {Object} config
     * @param {ComponentConfigurer} config.configurer
     * @param {AbstractComponentOptions} options
     */
    constructor({configurer, ...options}) {
        configurer = configurer ?? new DefaultComponentConfigurer(options);
        configurer.configure(this);
    }

    /**
     * @param {*=} value
     * @return {this}
     */
    render(value) {
        if (value != null) {
            this.doWithState(sh => {
                sh.replace(value);
            });
        } else if (this.stateInitializer) {
            this._initializeState();
        }
        return this;
    }

    /**
     * @protected
     */
    _initializeState() {
        this.doWithState((stateHolder) => {
            this.stateInitializer.load(stateHolder);
        });
    }

    /**
     * Offers the state for manipulation then updates the view.
     *
     * @param {function(state: StateHolder)} stateUpdaterFn
     * @return {StateChange[]}
     */
    doWithState(stateUpdaterFn) {
        stateUpdaterFn(this.stateHolder);
        this.stateChangesHandlerAdapter.processStateChanges(this.stateHolder.stateChangesCollector);
    }

    /**
     * set state to undefined
     */
    close() {
        this.stateHolder.replace();
    }
}