/**
 * Defaults:
 *
 * tableId = tableId or $table.data("id") or $table.attr("id")
 * bodyRowTmplId = bodyRowTmplId or ${tableId}RowTmpl
 */
class MustacheTableElemAdapter extends TableElementAdapter {
    /**
     * @param {string|jQuery<HTMLTableRowElement>} tableId
     * @param options
     */
    constructor(options = new MustacheTableElemAdapterOptions()) {
        super(options);
        this._setupBodyRowTmplHtml(options.bodyRowTmplId, options.bodyRowTmplHtml);
        this._setupBodyTmplHtml(options.bodyTmplHtml);
    }

    /**
     * This is the table row; evaluation order: bodyRowTmplHtml then bodyRowTmplId
     *
     * @param bodyRowTmplId {string}
     * @param bodyRowTmplHtml {string}
     * @protected
     */
    _setupBodyRowTmplHtml(bodyRowTmplId, bodyRowTmplHtml) {
        bodyRowTmplId = bodyRowTmplId ?? `${this.tableId}RowTmpl`;
        if (bodyRowTmplHtml) {
            this.bodyRowTmplHtml = bodyRowTmplHtml;
        } else if ($(`#${bodyRowTmplId}`).length) {
            this.bodyRowTmplHtml = HtmlUtils.templateTextOf(bodyRowTmplId);
        } else {
            this.bodyRowTmplHtml = DomUtils.htmlIncludingSelfOf(this.$bodyRowTmpl);
        }
    }

    /**
     * This is the table body.
     *
     * @param bodyTmplHtml {string}
     * @protected
     */
    _setupBodyTmplHtml(bodyTmplHtml) {
        if (bodyTmplHtml != null) {
            this.bodyTmplHtml = bodyTmplHtml;
        } else if (this.bodyRowTmplHtml) {
            this.bodyTmplHtml = "{{#items}}{{> bodyRow}}{{/items}}";
        }
    }

    renderBodyWithTemplate(data) {
        // return Mustache.render(this.bodyTmplHtml, data, {bodyRow: this.bodyRowTmplHtml})
        Handlebars.registerPartial("bodyRow", this.bodyRowTmplHtml)
        const html = this._renderTemplate(data, this.bodyTmplHtml);
        super.$tbody.html(html);
    }

    /**
     * @param {number|string} rowToReplaceId
     * @param {EntityRow=} entityRow
     * @param {string=} rowTmplHtml
     */
    replaceEntityRow(rowToReplaceId, entityRow, rowTmplHtml) {
        const newRowHtml = this._renderEntityRow(entityRow, rowTmplHtml);
        super.replaceRow(newRowHtml, rowToReplaceId);
    }

    /**
     * Here entityRow is needed for the positioning properties.
     *
     * @param {EntityRow} entityRow
     * @param {string=} rowTmplHtml
     */
    createEntityRow(entityRow, rowTmplHtml) {
        const newRowHtml = this._renderEntityRow(entityRow, rowTmplHtml);
        super.createRow(newRowHtml, entityRow);
    }

    /**
     * @param {EntityRow=} entityRow
     * @param {string=} rowTmplHtml
     * @return {string}
     * @private
     */
    _renderEntityRow(entityRow, rowTmplHtml = this.bodyRowTmplHtml) {
        const dataToRender = _.defaults({}, entityRow?.entity, {[`${JQueryWidgetsConfig.OWNER_ATTRIBUTE}`]: this.owner});
        return this._renderTemplate(dataToRender, rowTmplHtml);
    }

    /**
     * @param {{}} data
     * @param {string} rowTmplHtml
     * @return {string}
     * @private
     */
    _renderTemplate(data, rowTmplHtml) {
        // return data ? Mustache.render(rowTmplHtml, data) : rowTmplHtml;
        if (data) {
            const template = Handlebars.compile(rowTmplHtml);
            return template(data);
        } else {
            return rowTmplHtml;
        }
    }

    /**
     * @return {jQuery<HTMLTableRowElement>} the row template for this table
     */
    get $bodyRowTmpl() {
        return super.$firstRow;
    }
}