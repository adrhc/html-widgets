import TypeStateChangeEnhancer from "./change/enhancer/TypeStateChangeEnhancer.js";

/**
 * @template SCT, SCP
 */
export default class StateChangesCollector {
    /**
     * @type {StateChangeEnhancer<SCT, SCP>}
     */
    stateChangeEnhancer;
    /**
     * @type {StateChange<SCT, SCP>[]}
     */
    stateChanges = [];

    /**
     * @param {StateChangeEnhancer<SCT, SCP>=} stateChangeEnhancer
     * @constructor
     */
    constructor(stateChangeEnhancer) {
        this.stateChangeEnhancer = stateChangeEnhancer ?? new TypeStateChangeEnhancer();
    }

    /**
     * @param {StateChange<SCT, SCP>|undefined} stateChange
     */
    collect(stateChange) {
        const enhancedStateChange = this.stateChangeEnhancer.enhance(stateChange);
        if (!enhancedStateChange) {
            return undefined;
        }
        this.stateChanges.push(enhancedStateChange);
        return enhancedStateChange;
    }

    /**
     * @return {StateChange<SCT, SCP>}
     */
    consumeOne() {
        return this.stateChanges.shift();
    }

    /**
     * @return {StateChange<SCT, SCP>[]}
     */
    consumeAll() {
        const changes = this.stateChanges;
        this.stateChanges = [];
        return changes;
    }

    /**
     * @param {StateChangesCollector} stateChangesCollector
     */
    collectByConsumingChanges(stateChangesCollector) {
        stateChangesCollector.consumeAll().forEach(stateChange => this.collect(stateChange));
    }
}