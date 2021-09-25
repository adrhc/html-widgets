import AbstractView from "./AbstractView.js";
import {$childrenRoomOf} from "../Puppeteer.js";
import {dataAttributesOf, jQueryOf, templateTextOf} from "../../util/DomUtils.js";
import GlobalConfig, {dataPart, dataPartSelectorOf, dataType, ownerOf} from "../../util/GlobalConfig.js";
import {generateHtml} from "../../util/HtmlGenerator.js";

/**
 * @typedef {Bag} ChildFrameAttributes
 * @property {string=} templateId is used by child's component to populate its space (aka frame)
 * @property {string=} componentType
 * @property {string=} htmlTag
 */
/**
 * @typedef {Object} ChildrenRoomViewOptions
 * @property {string=} parentId
 * @property {string|jQuery<HTMLElement>=} elemIdOrJQuery is the parent's element id or jQuery<HTMLElement>
 * @property {string=} frameTemplate is the element containing the data-type and data-part
 * @property {string=} frameTemplateId
 * @property {string=} childTemplateId is a shortcut for ChildFrameAttributes.templateId
 * @property {boolean=} newChildrenGoLast
 * @property {boolean=} dontRemoveChildren
 * @property {ChildFrameAttributes=} childFrameAttributes
 */
/**
 * @extends {AbstractView}
 */
export default class ChildrenRoomView extends AbstractView {
    /**
     * @type {jQuery<HTMLElement>}
     */
    $childrenRoom;
    /**
     * @type {boolean}
     */
    dontRemoveChildren;
    /**
     * @type {string}
     */
    frameTemplate;
    /**
     * @type {string}
     */
    owner;
    /**
     * @type {string|jQuery<HTMLElement>}
     */
    parentElem;
    /**
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
     * @param {ChildrenRoomViewOptions} options
     */
    constructor({
                    parentId,
                    elemIdOrJQuery,
                    frameTemplate,
                    frameTemplateId,
                    childTemplateId,
                    newChildrenGoLast,
                    dontRemoveChildren,
                    childFrameAttributes = {templateId: childTemplateId},
                }) {
        super();
        this.parentElem = jQueryOf(elemIdOrJQuery);
        this.owner = parentId;
        this.place = (newChildrenGoLast ?? false) ? "append" : "prepend";
        this.dontRemoveChildren = dontRemoveChildren ?? false;
        this.frameTemplate = frameTemplate ?? this._createFrameTemplate(frameTemplateId, childFrameAttributes);
    }

    /**
     * Announce that parent updated its view.
     */
    parentUpdated() {
        this.$childrenRoom = $childrenRoomOf(this.parentElem);
    }

    /**
     * @param {PartName} partName
     */
    create(partName) {
        if (this._childFrameExists(partName)) {
            return;
        }
        const kidFrame = generateHtml(this.frameTemplate, {partName, [GlobalConfig.OWNER_ATTR]: this.owner});
        this.$childrenRoom[this.place](kidFrame);
    }

    /**
     * @param {PartName} name
     */
    remove(name) {
        this.$childrenRoom.children(dataPartSelectorOf(name)).remove();
    }

    /**
     * @param {string} partName
     * @return {boolean}
     * @protected
     */
    _childFrameExists(partName) {
        return !!this._$childFrameByName(partName).length;
    }

    /**
     * @param {PartName} name
     * @return {jQuery<HTMLElement>}
     * @protected
     */
    _$childFrameByName(name) {
        return this.$childrenRoom.children(dataPartSelectorOf(name));
    }

    /**
     * @param {string=} frameTemplateId
     * @param {ChildFrameAttributes=} childFrameAttributes
     * @protected
     */
    _createFrameTemplate(frameTemplateId, childFrameAttributes) {
        if (frameTemplateId) {
            return templateTextOf(frameTemplateId);
        } else {
            return this._templateFromChildFrameAttributes(childFrameAttributes);
        }
    }

    /**
     * @param {ChildFrameAttributes=} childFrameAttributes
     * @return {string}
     * @protected
     */
    _templateFromChildFrameAttributes({templateId, htmlTag = "div", componentType = "simple", ...rest}) {
        // {{this}} will be the part name when the kid's frame will be created
        return `<${htmlTag} ${ownerOf(this.owner)} ${dataPart()}="{{partName}}" ${dataType()}="${componentType}" data-template-id="${templateId}" ${dataAttributesOf(rest)}></${htmlTag}>`;
    }
}