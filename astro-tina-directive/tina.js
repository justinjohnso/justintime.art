/**
 * Hydrate on first click on the window
 * @type {import('astro').ClientDirective}
 */
export default async (load, options, el) => {
  try {
    const _isInIframe = window.self !== window.top
    if (!_isInIframe) {
      return
    }

    const hydrate = await load()
    await hydrate()
  } catch (error) {
    console.error('An error occurred in the Tina client directive:', error)
  }
}
