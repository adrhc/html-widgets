import SimpleComponent from "../core/SimpleComponent.js";
import CopyStateChangeHandler from "../core/CopyStateChangeHandler.js";
import {addStateChangeHandler} from "../core/component/OptionsDsl.js";

/**
 * @typedef {Object} DebuggerOptions
 * @property {boolean=} showAsJson
 * @property {string=} debuggerElemIdOrJQuery
 * @property {string=} initialDebuggerMessage
 */

/**
 * creates then adds a debugger extra StateChangesHandler
 *
 * @param {DebuggerOptions=} debuggerOptions
 * @return {OptionsDsl}
 */
export function addDebugger(debuggerOptions = {}) {
    const debuggerStateChangeHandler = createDebuggerStateChangeHandler(debuggerOptions);
    return addStateChangeHandler(debuggerStateChangeHandler);
}

/**
 * @param {Object=} debuggerOptions
 * @param {boolean=} debuggerOptions.showAsJson
 * @param {string=} debuggerOptions.debuggerElemIdOrJQuery
 * @param {string=} debuggerOptions.initialDebuggerMessage
 * @return {CopyStateChangeHandler}
 */
function createDebuggerStateChangeHandler({showAsJson, debuggerElemIdOrJQuery, initialDebuggerMessage} = {}) {
    showAsJson = showAsJson ?? true;
    debuggerElemIdOrJQuery = debuggerElemIdOrJQuery ?? "debugger";
    initialDebuggerMessage = initialDebuggerMessage ?? "state debugger";
    const simpleDebugger = new SimpleComponent({
        elemIdOrJQuery: debuggerElemIdOrJQuery,
        initialState: initialDebuggerMessage
    }).render();
    return new CopyStateChangeHandler(simpleDebugger, showAsJson);
}
