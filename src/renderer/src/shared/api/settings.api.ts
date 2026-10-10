export const settingsApi = {
  get: () => window.api.settings.get(),
  
  set: (settings) =>
    window.api.settings.set(
      settings
    ),
};