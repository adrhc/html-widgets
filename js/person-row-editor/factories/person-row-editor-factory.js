class PersonRowEditorFactory {
    create(mustacheTableElemAdapter) {
        const editableRow = new EditableRow(mustacheTableElemAdapter, {rowTmplId: "personsEditableRowTmpl"});
        const buttonsRow = new ButtonsRow(mustacheTableElemAdapter, {});
        const rowEditorView = new RowEditorView(editableRow, buttonsRow);
        return new PersonRowEditorComponent(rowEditorView);
    }
}