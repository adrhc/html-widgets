import animate from "./ro/go/adrhc/html-puppeteer/core/Puppeteer.js";
import {registerComponentType} from "./ro/go/adrhc/html-puppeteer/core/ComponentFactories.js";
import PeriodicallyStateChangingComponent
    from "./ro/go/adrhc/app/components/periodically-state-changing/PeriodicallyStateChangingComponent.js";
import {generateAndAppendDogs} from "./ro/go/adrhc/app/Generators.js";
import ClockEventsBinder from "./ro/go/adrhc/app/components/event-binders/ClockEventsBinder.js";
import {addClockDebugger} from "./ro/go/adrhc/app/components/periodically-state-changing/PeriodicallyStateChangingOptionsBuilder.js";
import {getTotalHeight} from "./ro/go/adrhc/html-puppeteer/util/DomUtils.js";

$(() => {
    registerComponentType("periodically-state-changing",
        (options) => new PeriodicallyStateChangingComponent(options));

    animate(addClockDebugger({elemIdOrJQuery: "clock-debugger"})
        .addDebugger({elemIdOrJQuery: "debugger-component"})
        .to({
            stateGeneratorFn: (componentConfig, clockStateChange) => {
                setTimeout(() => {
                    $('textarea').height(0);
                    $('textarea').height(getTotalHeight);
                });
                return generateAndAppendDogs({
                    interval: (/** @type {ClockState} */ clockStateChange.newState)?.interval
                }, 2);
            },
            eventsBinderProviders: [component => new ClockEventsBinder(component)]
        }));
});