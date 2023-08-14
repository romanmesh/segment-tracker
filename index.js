/**
 * Self-invoking function to initialize Segment tracking and intercept navigation changes.
 * @param {Window} global - The global window object.
 */
;(function (global) {
  let previousURL = window.location.href

  /**
   * Initializes Segment tracking for click events and navigation changes.
   */
  function initSegmentTracking() {
    document.body.addEventListener("click", handleElementClick)
    window.addEventListener("popstate", () => trackPageViewed(previousURL))
    window.addEventListener("hashchange", () => trackPageViewed(previousURL))
    trackPageViewed()
  }

  /**
   * Handles click events on DOM elements. Sends tracking data to Segment
   * if the clicked element has a `data-track-event` attribute.
   * @param {Event} event - The DOM click event.
   */
  function handleElementClick(event) {
    const analytics = global.analytics || window.analytics
    const eventName = event.target.getAttribute("data-track-event")
    if (eventName) {
      const eventData = {
        ...getDataAttributes(event.target),
      }

      if (analytics && typeof analytics.track === "function") {
        analytics.track(eventName, eventData)
      } else {
        console.warn("Segment analytics is not available.")
      }
    }
  }

  /**
   * Collects all data attributes from a given DOM element that start with `data-event-`.
   * @param {HTMLElement} element - The DOM element to gather data attributes from.
   * @returns {Object} - An object containing the data attributes.
   */
  function getDataAttributes(element) {
    const data = {}
    for (let attr of element.attributes) {
      if (attr.name.startsWith("data-event-")) {
        const key = attr.name.slice("data-event-".length)
        data[key] = attr.value
      }
    }
    return data
  }

  /**
   * Gathers page related data like path, referrer, search query, title, and full URL.
   * @param {string} [referrer=document.referrer] - Referrer of the page.
   * @returns {Object} - An object containing the page data.
   */
  function gatherEventData(referrer = document.referrer) {
    return {
      path: window.location.pathname,
      referrer: referrer,
      search: window.location.search,
      title: document.title,
      url: window.location.href,
    }
  }

  /**
   * Sends a 'Page Viewed New' event to Segment with relevant page data.
   * @param {string} [referrer=document.referrer] - Referrer of the page.
   */
  function trackPageViewed(referrer = document.referrer) {
    const eventData = gatherEventData(referrer)
    const analytics = global.analytics || window.analytics
    if (analytics && typeof analytics.track === "function") {
      analytics.track("Page Viewed New", eventData)
    } else {
      console.warn("Segment analytics is not available for Page Viewed event.")
    }
  }

  // Intercept changes to the history to track page views
  /**
   * Intercept history.pushState to track page views after a navigation change.
   */
  const originalPushState = history.pushState
  history.pushState = function () {
    originalPushState.apply(this, arguments)
    setTimeout(() => {
      trackPageViewed(previousURL)
      // Update the previousURL after tracking the event.
      previousURL = window.location.href
    }, 0)
  }

  /**
   * Intercept history.replaceState to track page views after a navigation change.
   */
  const originalReplaceState = history.replaceState
  history.replaceState = function () {
    originalReplaceState.apply(this, arguments)
    setTimeout(() => {
      trackPageViewed(previousURL)
      previousURL = window.location.href
    }, 0)
  }

  initSegmentTracking()
})(typeof window !== "undefined" ? window : this)
