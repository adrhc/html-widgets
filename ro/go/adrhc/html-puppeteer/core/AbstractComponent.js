import DefaultComponentConfigurator from "./DefaultComponentConfigurator.js";
import {applyExtraConfigurators} from "./ComponentConfigurator.js";

/**
 * @typedef {Bag & ValuesStateInitializerOptions & StateChangesHandlersInvoker & AbstractTemplatingViewOptionsWithView} AbstractComponentOptions
 * @property {string=} elemIdOrJQuery
 * @property {StateHolder=} stateHolder
 * @property {StateInitializer=} stateInitializer
 * @property {StateChangesHandlersInvoker=} stateChangesHandlersInvoker
 * @property {EventsBinder=} eventsBinder
 * @property {ComponentConfigurator=} configurator
 * @property {ComponentConfigurator[]=} extraConfigurators
 */
/**
 * @typedef {AbstractComponentOptions & DataAttributes} ComponentConfigField
 */
/**
 * @abstract
 */
export default class AbstractComponent {
    /**
     * @type {ComponentConfigField}
     */
    config;
    /**
     * @type {DataAttributes}
     */
    dataAttributes;
    /**
     * @type {EventsBinder}
     */
    eventsBinder;
    /**
     * @type {AbstractComponentOptions}
     */
    options;
    /**
     * @type {StateChangesHandlersInvoker}
     */
    stateChangesHandlersInvoker;
    /**
     * @type {StateHolder}
     */
    stateHolder;
    /**
     * @type {StateInitializer}
     */
    stateInitializer;

    /**
     * @param {AbstractComponentOptions} options
     */
    constructor(options) {
        this._configure(options);
    }

    /**
     * @param {AbstractComponentOptions} options
     * @protected
     */
    _configure(options) {
        const configurator = options.configurator ?? new DefaultComponentConfigurator(options);
        configurator.configure(this);
        applyExtraConfigurators(this);
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
        } else {
            this.doWithState((sh) => {
                this.stateInitializer?.load(sh);
            });
        }
        this.eventsBinder?.attachEventHandlers();
        return this;
    }

    /**
     * Offers the state for manipulation then updates the view.
     *
     * @param {function(state: StateHolder)} stateUpdaterFn
     */
    doWithState(stateUpdaterFn) {
        stateUpdaterFn(this.stateHolder);
        this.stateChangesHandlersInvoker.processStateChanges(this.stateHolder.stateChangesCollector);
    }

    /**
     * set state to undefined
     */
    close() {
        this.eventsBinder?.detachEventHandlers();
        this.stateHolder.replace();
    }
}
