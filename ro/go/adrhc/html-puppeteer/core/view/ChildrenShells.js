import {jQueryOf} from "../../util/DomUtils.js";
import GlobalConfig from "../../util/GlobalConfig.js";
import createShellTemplate, {areShellTemplateOptionsEmpty} from "./ChildShellTemplate.js";
import ChildrenShellFinder from "./ChildrenShellFinder.js";
import {newIdImpl} from "../component/configurator/DefaultComponentConfigurator.js";
import {isTrue} from "../../util/AssertionUtils.js";
import {generateHtml} from "../../util/HtmlGenerator.js";

/**
 * @typedef {ChildShellTemplateOptions} ChildrenShellsOptions
 * @property {string} componentId
 * @property {string=} parentHtml
 * @property {string|jQuery<HTMLElement>} elemIdOrJQuery is the parent's element id or jQuery<HTMLElement>
 * @property {boolean=} newChildrenGoLast
 */
export default class ChildrenShells {
    /**
     * @type {jQuery<HTMLElement>}
     */
    $containerElem;
    /**
     * @type {ChildrenShellFinder}
     */
    childrenShellFinder;
    /**
     * it's the child shell template id
     *
     * @type {string}
     */
    parentId;
    /**
     * specify where to place new kids (append|prepend)
     *
     * @type {string}
     */
    place;
    /**
     * @type {boolean}
     */
    shellIsParentHtml;
    /**
     * @type {string}
     */
    shellTemplate;

    /**
     * @param {ChildrenShellsOptions} options
     * @param {ChildShellTemplateOptions} options.restOfOptions
     */
    constructor({
                    componentId,
                    parentHtml,
                    elemIdOrJQuery,
                    newChildrenGoLast,
                    ...restOfOptions
                }) {
        this.parentId = componentId;
        this.$containerElem = jQueryOf(elemIdOrJQuery);
        this.place = newChildrenGoLast ? "append" : "prepend";
        this.childrenShellFinder = new ChildrenShellFinder(elemIdOrJQuery);
        this.shellIsParentHtml = areShellTemplateOptionsEmpty(restOfOptions);
        this.shellTemplate = this.shellIsParentHtml ? parentHtml?.trim() : createShellTemplate(componentId, restOfOptions);
    }

    /**
     * @param {PartName} partName
     */
    getOrCreateShell(partName) {
        const $shell = this.childrenShellFinder.$childShellByName(partName);
        if ($shell) {
            return $shell;
        }
        isTrue(this.shellTemplate != null,
            `"${partName}" shell is missing from "${this.parentId}"!\n\n"${this.parentId}" content is:\n${this.$containerElem.html()}\n"${this.parentId}" text is:\n${this.$containerElem.text()}`);
        const kidShell = this.createShell(partName);
        this.$containerElem[this.place](kidShell);
        return this.childrenShellFinder.$childShellByName(partName);
    }

    /**
     * @param {PartName} partName
     * @return {string}
     * @protected
     */
    createShell(partName) {
        const viewValues = {
            [GlobalConfig.PART]: partName,
            [GlobalConfig.OWNER]: this.parentId,
            [GlobalConfig.COMPONENT_ID]: newIdImpl(partName, this.parentId),
        };
        let shellTemplate = this.shellTemplate;
        if (this.shellIsParentHtml) {
            shellTemplate = this.setPartOwnerAndIdToShellTemplate(viewValues);
        }
        return generateHtml(shellTemplate, viewValues);
    }

    /**
     * @param {Bag} partOwnerAndId
     * @return {string}
     * @protected
     */
    setPartOwnerAndIdToShellTemplate(partOwnerAndId) {
        const $shell = $(this.shellTemplate);
        isTrue($shell.length === 1,
            `$shell template from parent is ${$shell?.length ? "too crowded" : "empty"}! should have exactly one element!`)
        Object.keys(partOwnerAndId).forEach(key => $shell.attr(`data-${key}`, partOwnerAndId[key]));
        return $shell[0].outerHTML;
    }

    /**
     * @param {PartName} partName
     */
    removeShell(partName) {
        if (this.shellTemplate != null) {
            this.childrenShellFinder.$childShellByName(partName)?.remove();
        }
    }
}
