import AbstractView from "./AbstractView.js";
import {jQueryOf} from "../../util/DomUtils.js";
import GlobalConfig from "../../util/GlobalConfig.js";
import createShellTemplate, {areShellTemplateOptionsEmpty} from "./ChildShellTemplate.js";
import ChildrenShellFinder from "./ChildrenShellFinder.js";
import {newIdImpl} from "../component/configurator/DefaultComponentConfigurator.js";
import {isTrue} from "../../util/AssertionUtils.js";
import {generateHtml} from "../../util/HtmlGenerator.js";

/**
 * @typedef {ChildShellTemplateOptions} ChildrenShellsViewOptions
 * @property {string} componentId
 * @property {string=} parentHtml
 * @property {string|jQuery<HTMLElement>} elemIdOrJQuery is the parent's element id or jQuery<HTMLElement>
 * @property {boolean=} newGuestsGoLast
 */
/**
 * @extends {AbstractView}
 */
export default class ChildrenShellsView extends AbstractView {
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
     * @param {ChildrenShellsViewOptions} options
     * @param {ChildShellTemplateOptions} options.restOfOptions
     */
    constructor({
                    componentId,
                    parentHtml,
                    elemIdOrJQuery,
                    newGuestsGoLast,
                    ...restOfOptions
                }) {
        super();
        this.parentId = componentId;
        this.$containerElem = jQueryOf(elemIdOrJQuery);
        this.place = newGuestsGoLast ? "append" : "prepend";
        this.childrenShellFinder = new ChildrenShellFinder(componentId, elemIdOrJQuery);
        this.shellIsParentHtml = areShellTemplateOptionsEmpty(restOfOptions);
        this.shellTemplate = this.shellIsParentHtml ? parentHtml?.trim() : createShellTemplate(componentId, restOfOptions);
    }

    /**
     * @param {PartName} partName
     */
    create(partName) {
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
            shellTemplate = this.setPartOwnerIdToShellTemplate(viewValues);
        }
        return generateHtml(shellTemplate, viewValues);
    }

    /**
     * @param {Bag} partOwnerIdValues
     * @return {string}
     * @protected
     */
    setPartOwnerIdToShellTemplate(partOwnerIdValues) {
        const $shell = $(this.shellTemplate);
        isTrue($shell.length === 1,
            `$shell template from parent is ${$shell?.length ? "too crowded" : "empty"}! should have exactly one element!`)
        Object.keys(partOwnerIdValues).forEach(key => $shell.attr(`data-${key}`, partOwnerIdValues[key]));
        return $shell[0].outerHTML;
    }

    /**
     * @param {PartName} partName
     */
    remove(partName) {
        if (this.shellTemplate != null) {
            this.childrenShellFinder.$childShellByName(partName).remove();
        }
    }

    /**
     * @param {*} values
     */
    replace(values) {
        // do nothing
    }
}
