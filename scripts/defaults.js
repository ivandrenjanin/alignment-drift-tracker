export const MODULE_KEY = "alignment-drift-tracker";
export const FLAGS = { DRIFT: "drift" };
export const TRACKS = {
    EVIL: { KEY: "evil", LABEL: "evil-label", DEFAULT: "Corruption" },
    GOOD: { KEY: "good", LABEL: "good-label", DEFAULT: "Radiance" },
    NEUTRAL: { KEY: "neutral", LABEL: "neutral-label", DEFAULT: "Balance" }
};
export const DEFAULT_DRIFT = { good: 0, evil: 0, neutral: 0, dominantTrait: "" };