import StaticContainerComponent from "./StaticContainerComponent.js";
import {REMOVE_CONTENT, USE_CSS} from "../view/SimpleView.js";

/**
 * @template SCT,SCP
 *
 * @typedef {Object} SCT
 * @property {OptionalPartName=} activePart
 * @property {SCP=} partValue
 */
/**
 * @extends {StaticContainerComponent}
 */
export default class SwitcherComponent extends StaticContainerComponent {
    /**
     * @return {AbstractComponent}
     */
    get activeComponent() {
        const activePart = this.activePart;
        return this.childrenComponents.getChildByPartName(activePart);
    }

    /**
     * @return {PartName}
     */
    get activePart() {
        return this.getPart("activePart", true);
    }

    /**
     * @param {StaticContainerComponentOptions} options
     * @param {ViewRemovalStrategy} options.childrenRemovalStrategy
     * @param {StaticContainerComponentOptions=} restOfOptions
     */
    constructor({childrenRemovalStrategy, ...restOfOptions}) {
        super({childrenRemovalStrategy: USE_CSS, ...restOfOptions});
    }

    /**
     * Completely replaces the component's state and creates the children.
     *
     * @param {SCT=} newState
     */
    replaceState(newState) {
        super.replaceState(newState);
        this.childrenComponents.closeChildren();
        if (newState?.activePart != null) {
            this.switchTo(newState.activePart, newState.partValue);
        }
    }

    /**
     * @param {PartName=} previousPartName
     * @param {SCP|PartName=} newPart
     * @param {PartName=} newPartName
     * @param {boolean=} dontRecordChanges
     */
    replacePart(previousPartName, newPart, newPartName = previousPartName, dontRecordChanges) {
        if (newPartName === "activePart") {
            this.switchTo(newPart);
        } else {
            this.switchTo(newPartName, newPart);
        }
    }

    /**
     * @param {SCT|PartName} partName
     * @param {SCP=} partValue
     */
    switchTo(partName, partValue) {
        const activeComponent = this.activeComponent;
        const activeState = activeComponent?.getStateCopy();
        const switchToComponent = this.childrenComponents.getChildByPartName(partName);
        activeComponent?.close();
        super.replacePart("activePart", partName);
        switchToComponent.render(partValue ?? activeState);
    }
}