import { registerSettings } from "./settings.js";
import { registerAlignmentDriftTab, handleTabClick } from "./adt-tab.js";
import { registerHandlebarsHelpers } from "./handlebars-helpers.js";

Hooks.once("init", () => {
    registerHandlebarsHelpers();
    registerSettings();
});

Hooks.once('tidy5e-sheet.ready', registerAlignmentDriftTab);
Hooks.on('tidy5e-sheet.selectTab', handleTabClick);
