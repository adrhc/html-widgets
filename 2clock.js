import ClockComponent from "./ro/go/adrhc/app/components/clock/ClockComponent.js";
import {withDebuggerConfigurator} from "./ro/go/adrhc/html-puppeteer/util/DebuggingUtils.js";

$(() => {
    new ClockComponent(withDebuggerConfigurator({
        elemIdOrJQuery: "component",
        interval: 2000
    })).render("wait 2s for a state change");
})