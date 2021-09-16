import ComponentIllustrator from "./ComponentIllustrator.js";
import SimpleView from "./SimpleView.js";

/**
 * @typedef {AbstractTemplatingViewOptions} AbstractTemplatingViewOptionsWithView
 * @property {AbstractView=} view
 */
export default class SimpleComponentIllustrator extends ComponentIllustrator {
    /**
     * @param {AbstractTemplatingViewOptionsWithView} options
     * @param {AbstractTemplatingViewOptions=} viewConfig
     */
    constructor({view, ...viewConfig}) {
        super();
        this.view = view ?? this._createView(viewConfig);
    }

    /**
     * @param {AbstractTemplatingViewOptions} viewConfig
     * @return {SimpleView}
     * @protected
     */
    _createView(viewConfig) {
        return new SimpleView(viewConfig);
    }
}