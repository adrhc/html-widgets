import {dataPartSelectorOf, dataTypeSelector} from "../../util/SelectorUtils.js";
import {jQueryOf} from "../../util/Utils.js";
import {typeOf} from "../../util/GlobalConfig.js";

export default class ChildrenShellFinder {
    /**
     * @type {jQuery<HTMLElement>}
     */
    $containerElem;
    /**
     * @type {boolean}
     */
    containerIsComponent;

    /**
     * @param {string|jQuery<HTMLElement>} elemIdOrJQuery
     */
    constructor(elemIdOrJQuery) {
        this.$containerElem = jQueryOf(elemIdOrJQuery);
        this.containerIsComponent = typeOf(this.$containerElem) != null;
    }

    /**
     * @param {OptionalPartName=} partName
     * @return {jQuery<HTMLElement>[]}
     */
    $childrenShells(partName) {
        if (this.containerIsComponent) {
            return this.$containerChildrenShells(partName);
        } else {
            return this.$childrenShellsForContainerElem(partName);
        }
    }

    /**
     * @param {OptionalPartName=} partName
     * @return {jQuery<HTMLElement>[]}
     * @protected
     */
    $childrenShellsForContainerElem(partName) {
        return this.$containerElem
            .find(`${partName == null ? dataTypeSelector() : dataPartSelectorOf(partName)}`)
            .toArray()
            .map(shell => [shell, $(shell).parents(dataTypeSelector())])
            .filter(([, $parents]) => !$parents.length)
            .map(([shell]) => $(shell));
    }

    /**
     * @param {OptionalPartName=} partName
     * @return {jQuery<HTMLElement>[]}
     * @protected
     */
    $containerChildrenShells(partName) {
        return this.$containerElem
            // one could use dataPartSelector() instead of dataTypeSelector() because a child
            // component is supposed to have "data-part" set; for switcher though "data-part"
            // will most likely miss, being replaced by "data-active-name" hence is better to
            // use dataTypeSelector() here
            .find(`${partName == null ? dataTypeSelector() : dataPartSelectorOf(partName)}`)
            .toArray()
            .map(shell => [shell, $(shell).parents(dataTypeSelector())])
            .filter(([, $parents]) => $parents[0] === this.$containerElem[0])
            .map(([shell]) => $(shell));
    }

    /**
     * @param {PartName} partName
     * @return {jQuery<HTMLElement>[]}
     */
    $childShellsByPartName(partName) {
        return this.$childrenShells(partName);
    }
}