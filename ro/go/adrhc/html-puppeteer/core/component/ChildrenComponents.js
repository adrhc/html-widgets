import {$getPartElem, createComponent} from "../Puppeteer.js";
import {isTrue} from "../../util/AssertionUtils.js";
import {childStateOf} from "./configurator/DefaultComponentConfigurator.js";

/**
 * @typedef {{[name: string]: AbstractComponent}} ComponentsCollection
 */
/**
 * @template SCT, SCP
 */
export default class ChildrenComponents {
    /**
     * @type {string|jQuery<HTMLElement>}
     */
    elemIdOrJQuery;
    /**
     * @type {ComponentsCollection}
     */
    items = {};
    /**
     * @type {AbstractComponent}
     */
    parent;

    /**
     * @param {AbstractComponent} parent
     */
    constructor(parent) {
        this.parent = parent;
        this.elemIdOrJQuery = parent.config.elemIdOrJQuery;
    }

    /**
     * @param {PartName} partName
     * @param {jQuery<HTMLElement>} $shell
     */
    createItem(partName, $shell) {
        if (!$shell.length) {
            console.warn(`Missing child element for ${partName}!`);
            return undefined;
        }
        // at this point the item component's id is available as data-GlobalConfig.COMPONENT_ID on $shell
        const component = createComponent($shell, {parent: this.parent});
        isTrue(component != null, "[_createItem] the child's shell should exist!")
        this.items[partName] = component.render();
    }

    /**
     * @param {PartName} itemName
     */
    updateFromParent(itemName) {
        this.items[itemName].replaceState(childStateOf(itemName, this.parent));
    }

    /**
     * @param {PartName} partName
     * @return {boolean}
     */
    removeItem(partName) {
        if (!this.items[partName]) {
            console.error(`Trying to close missing child: ${partName}!`);
            return false;
        }
        this.items[partName].close();
        delete this.items[partName];
        return true;
    }

    /**
     * @param {string} itemId
     * @return {AbstractComponent|undefined}
     */
    getItemById(itemId) {
        return Object.values(this.items).find(it => it.id === itemId);
    }
}