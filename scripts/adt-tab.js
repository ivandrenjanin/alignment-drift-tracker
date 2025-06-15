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
                    { name: game.settings.get(MODULE_KEY, TRACKS.EVIL.LABEL), drift: drift.evil },
                    { name: game.settings.get(MODULE_KEY, TRACKS.GOOD.LABEL), drift: drift.good },
                    { name: game.settings.get(MODULE_KEY, TRACKS.NEUTRAL.LABEL), drift: drift.neutral }
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
            console.log({ track })

            const current = await actor.getFlag(MODULE_KEY, FLAGS.DRIFT);
            const drift = foundry.utils.deepClone(current);

            console.log({ drift, current });

            if (button.classList.contains("fa-plus")) {
                const result = drift[track] + 1;
                drift[track] = Math.min(13, result);
            } else if (button.classList.contains("fa-minus")) {
                if (drift[track] === 0) return;
                drift[track] = Math.max(0, drift[track] - 1);
            }

            await actor.setFlag(MODULE_KEY, FLAGS.DRIFT, drift);
        }
    });
}