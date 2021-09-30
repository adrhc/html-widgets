import {dataOwnerSelectorOf, dataPartSelectorOf} from "../../util/SelectorUtils.js";
import {isFalse} from "../../util/AssertionUtils.js";
import {jQueryOf} from "../../util/DomUtils.js";

export default class ChildrenShellFinder {
    /**
     * @type {jQuery<HTMLElement>}
     */
    $containerElem;
    /**
     * it's the child shell template id
     *
     * @type {string}
     */
    parentId;
    /**
     * @type {boolean}
     */
    persistentShells;

    /**
     * @param {string} parentId
     * @param {string|jQuery<HTMLElement>} elemIdOrJQuery
     * @param {boolean=} persistentShells
     */
    constructor(parentId, elemIdOrJQuery, persistentShells) {
        this.parentId = parentId;
        this.$containerElem = jQueryOf(elemIdOrJQuery);
        this.persistentShells = persistentShells;
    }

    /**
     * @param {string} partName
     * @return {jQuery<HTMLElement>|undefined}
     */
    $shellElemOf(partName) {
        if (this.persistentShells) {
            const $childByPartName = this._$shellByPartName(partName);
            return $childByPartName ? $childByPartName : this._$shellByOwnerAndPartName(partName);
        } else {
            return this._$shellByPartName(partName);
        }
    }

    /**
     * @param {string} partName
     * @return {jQuery<HTMLElement>|undefined}
     * @protected
     */
    _$shellByOwnerAndPartName(partName) {
        const byOwnerAndPartNameSelector = `${dataOwnerSelectorOf(this.parentId)}${dataPartSelectorOf(partName)}`
        return this._elemForSelector(byOwnerAndPartNameSelector, "find");
    }

    /**
     * @param {string} partName
     * @return {jQuery<HTMLElement>|undefined}
     * @protected
     */
    _$shellByPartName(partName) {
        const childByPartNameSelector = dataPartSelectorOf(partName);
        return this._elemForSelector(childByPartNameSelector, "children");
    }

    /**
     * @param {string} selector
     * @param {"children" | "find"} searchWith
     * @return {jQuery<HTMLElement>|undefined}
     * @protected
     */
    _elemForSelector(selector, searchWith) {
        const $child = this.$containerElem[searchWith](selector);
        isFalse($child.length > 1, `Found ${$child.length} of ${selector}!`);
        return $child.length ? $child : undefined;
    }
}