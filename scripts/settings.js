import { MODULE_KEY, TRACKS } from "./defaults.js";

class AlignmentDriftSettingsForm extends FormApplication {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "alignment-drift-settings",
            title: "Alignment Drift Tracker Settings",
            template: "/modules/alignment-drift-tracker/templates/settings.hbs",
            width: 400,
            closeOnSubmit: true
        });
    }

    async getData() {
        return {
            evil: game.settings.get(MODULE_KEY, TRACKS.EVIL.LABEL),
            good: game.settings.get(MODULE_KEY, TRACKS.GOOD.LABEL),
            neutral: game.settings.get(MODULE_KEY, TRACKS.NEUTRAL.LABEL)
        };
    }

    async _updateObject(event, formData) {
        for (const [key, value] of Object.entries(formData)) {
            await game.settings.set(MODULE_KEY, `${key}-label`, value);
        }
    }
}

export function registerSettings() {
    game.settings.registerMenu(MODULE_KEY, "label-config", {
        name: "Alignment Drift Tracker Settings",
        label: "Configure Tracker Labels",
        hint: "Change how Evil, Good and Neutral tracks are named in this world.",
        icon: "fas fa-compass",
        type: AlignmentDriftSettingsForm,
        restricted: true
    });

    Object.values(TRACKS).forEach(track => {
        game.settings.register(MODULE_KEY, track.LABEL, {
            name: `${track.DEFAULT} Label`,
            scope: "world",
            config: false,
            type: String,
            default: track.DEFAULT
        });
    });
}