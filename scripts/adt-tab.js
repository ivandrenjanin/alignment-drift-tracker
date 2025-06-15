import { MODULE_KEY, FLAGS, TRACKS, DEFAULT_DRIFT } from "./defaults.js";

export function registerAlignmentDriftTab(api) {
    api.registerCharacterTab(
        new api.models.HandlebarsTab({
            title: 'Alignment Drift',
            path: '/modules/alignment-drift-tracker/templates/adt-tab.hbs',
            tabId: `${MODULE_KEY}-tab`,
            getData: async (sheet) => {
                const actor = sheet.actor;
                let drift = await actor.getFlag(MODULE_KEY, FLAGS.DRIFT);
                if (!drift) {
                    await actor.setFlag(MODULE_KEY, FLAGS.DRIFT, DEFAULT_DRIFT);
                    drift = foundry.utils.duplicate(DEFAULT_DRIFT);
                }
                const labels = [
                    { name: game.settings.get(MODULE_KEY, TRACKS.EVIL.LABEL), key: TRACKS.EVIL.KEY, drift: drift.evil },
                    { name: game.settings.get(MODULE_KEY, TRACKS.GOOD.LABEL), key: TRACKS.GOOD.KEY, drift: drift.good },
                    { name: game.settings.get(MODULE_KEY, TRACKS.NEUTRAL.LABEL), key: TRACKS.NEUTRAL.KEY, drift: drift.neutral }
                ];
                drift.max = drift.good + drift.evil + drift.neutral;

                return { sheet, labels, drift, dominantTrait: drift.dominantTrait };
            }
        })
    );
}

export function handleTabClick(app, element, newTabId) {
    if (newTabId !== `${MODULE_KEY}-tab`) return;
    element.addEventListener("click", async (event) => {
        if (!app.isEditable) return;

        const button = event.target.closest(".alignment-drift-tracker-counter");
        if (button) {
            const trackIndex = Number(button.dataset.track);
            const trackKeys = [TRACKS.EVIL.KEY, TRACKS.GOOD.KEY, TRACKS.NEUTRAL.KEY];
            const track = trackKeys[trackIndex];
            const actor = app.actor;
            const current = await actor.getFlag(MODULE_KEY, FLAGS.DRIFT);
            const drift = foundry.utils.deepClone(current);
            const max = drift.good + drift.evil + drift.neutral;
            if (max >= 13 && button.classList.contains("fa-plus")) {
                ui.notifications.warn("Maximum drift points reached. Cannot increase further.");
                return;
            }
            if (max <= 0 && button.classList.contains("fa-minus")) {
                ui.notifications.warn("No drift points to decrease.");
                return;
            }
            if (button.classList.contains("fa-plus")) {
                const result = drift[track] + 1;
                drift[track] = Math.min(13, result);
            } else if (button.classList.contains("fa-minus")) {
                if (drift[track] === 0) return;
                drift[track] = Math.max(0, drift[track] - 1);
            }
            await actor.setFlag(MODULE_KEY, FLAGS.DRIFT, drift);
        }

        const fateButton = event.target.closest(".alignment-drift-tracker-roll-fate");
        if (fateButton) {
            const trackIndex = Number(fateButton.dataset.track);
            const trackNames = [
                game.settings.get(MODULE_KEY, TRACKS.EVIL.LABEL),
                game.settings.get(MODULE_KEY, TRACKS.GOOD.LABEL),
                game.settings.get(MODULE_KEY, TRACKS.NEUTRAL.LABEL)
            ];

            const label = trackNames[trackIndex] || "Fate";
            new Roll("3df").roll({ async: true }).then(roll => {
                const results = roll.dice[0]?.results.map(r => r.result) || [];
                const count = { plus: 0, minus: 0, blank: 0 };
                for (let r of results) {
                    if (r === 1) count.plus++;
                    else if (r === -1) count.minus++;
                    else count.blank++;
                }

                let success = false;
                let color = "";
                // Corrution, Radiance, Balance
                // Check conditions for success
                // Corruption: 2 or more minus
                // Radiance: 2 or more plus
                // Balance: 2 or more blanks
                if (trackIndex === 0 && count.minus >= 2) {
                    success = true;
                    color = "#c0392b";
                } else if (trackIndex === 1 && count.plus >= 2) { // Radiance
                    success = true;
                    color = "#f1c40f";
                } else if (trackIndex === 2 && count.blank >= 2) { // Balance
                    success = true;
                    color = "#3498db";
                }

                let flavor = `${label} Fate Roll`;
                if (success) {
                    flavor = ` <span style='color:${color};font-weight:bold;'>${label} Fate Sealed</span>`;
                }
                roll.toMessage({
                    speaker: ChatMessage.getSpeaker({ actor: app.actor }),
                    flavor: flavor,
                });
            });
        }
    });

    // Listen for changes to the Dominant Trait input field
    element.addEventListener("change", async (event) => {
        if (!app.isEditable) return;
        const input = event.target.closest(".alignment-drift-tracker-dominant-trait-input");
        if (input) {
            const value = input.value;
            const actor = app.actor;
            const current = await actor.getFlag(MODULE_KEY, FLAGS.DRIFT);
            const drift = foundry.utils.deepClone(current);
            drift.dominantTrait = value;
            await actor.setFlag(MODULE_KEY, FLAGS.DRIFT, drift);
        }
    });
}