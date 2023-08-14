(function (global) {
  /**
   * Initializes the Segment tracking, listening to click events to track specified
   * data and also tracks the page viewed event.
   */
  function initSegmentTracking() {
    document.body.addEventListener("click", handleElementClick);
    window.addEventListener("popstate", trackPageViewed);
    window.addEventListener("hashchange", trackPageViewed);
    trackPageViewed();
  }

  /**
   * Event handler for DOM elements clicked. If the clicked element has a `data-track-event`
   * attribute, it gathers the relevant data and sends it to Segment.
   *
   * @param {Event} event - The DOM click event.
   */
  function handleElementClick(event) {
    const analytics = global.analytics || window.analytics;
    const eventName = event.target.getAttribute("data-track-event");
    if (eventName) {
      const eventData = {
        ...getDataAttributes(event.target),
      };

      // Check for analytics availability before calling it
      if (analytics && typeof analytics.track === "function") {
        analytics.track(eventName, eventData);
      } else {
        console.warn("Segment analytics is not available.");
      }
    }
  }

  /**
   * Collects all data attributes from a given DOM element that start with `data-event-`.
   *
   * @param {HTMLElement} element - The DOM element to gather data attributes from.
   * @returns {Object} - An object containing the data attributes.
   */
  function getDataAttributes(element) {
    const data = {};
    for (let attr of element.attributes) {
      if (attr.name.startsWith("data-event-")) {
        const key = attr.name.slice("data-event-".length);
        data[key] = attr.value;
      }
    }
    return data;
  }

  /**
   * Gathers page related data like path, referrer, search query, title, and full URL.
   *
   * @returns {Object} - An object containing the page data.
   */
  function gatherEventData() {
    return {
      path: window.location.pathname,
      referrer: document.referrer,
      search: window.location.search,
      title: document.title,
      url: window.location.href,
    };
  }

  /**
   * Sends a 'Page Viewed' event to Segment with relevant page data.
   */
  function trackPageViewed() {
    const eventData = gatherEventData();
    const analytics = global.analytics || window.analytics;
    // Check for analytics availability before calling it
    if (analytics && typeof analytics.track === "function") {
      analytics.track("Page Viewed New", eventData);
    } else {
      console.warn("Segment analytics is not available for Page Viewed event.");
    }
  }

  initSegmentTracking();
})(typeof window !== "undefined" ? window : this);
