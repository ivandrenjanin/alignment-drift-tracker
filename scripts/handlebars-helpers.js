export function registerHandlebarsHelpers() {
    Handlebars.registerHelper("range", (start, end) => Array.from({ length: end - start }, (_, i) => i + start));
    Handlebars.registerHelper("lt", (a, b) => a < b);
}