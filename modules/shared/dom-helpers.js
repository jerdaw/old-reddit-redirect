/**
 * DOM Helper Utilities
 * Shared DOM manipulation and query functions
 */

/**
 * Safely query a single element
 * @param {string} selector - CSS selector
 * @param {Element} [context=document] - Context element
 * @returns {Element|null} Found element or null
 */
export function $(selector, context = document) {
  try {
    return context.querySelector(selector);
  } catch (error) {
    console.warn(`[ORR] Invalid selector: ${selector}`, error);
    return null;
  }
}

/**
 * Safely query all matching elements
 * @param {string} selector - CSS selector
 * @param {Element} [context=document] - Context element
 * @returns {Element[]} Array of found elements
 */
export function $$(selector, context = document) {
  try {
    return Array.from(context.querySelectorAll(selector));
  } catch (error) {
    console.warn(`[ORR] Invalid selector: ${selector}`, error);
    return [];
  }
}

/**
 * Wait for element to appear in DOM
 * @param {string} selector - CSS selector
 * @param {number} [timeout=5000] - Timeout in milliseconds
 * @returns {Promise<Element>} Promise resolving to element
 */
export function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const element = $(selector);
    if (element) {
      resolve(element);
      return;
    }

    let timeoutId = null;
    const observer = new MutationObserver(() => {
      const element = $(selector);
      if (element) {
        observer.disconnect();
        if (timeoutId) clearTimeout(timeoutId);
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    timeoutId = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);

    // Register cleanup handler to disconnect observer if page unloads
    if (!window.orrCleanup) window.orrCleanup = [];
    const cleanup = () => {
      observer.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
    };
    window.orrCleanup.push(cleanup);
  });
}

/**
 * Add CSS class safely
 * @param {Element} element - Target element
 * @param {string} className - Class name to add
 */
export function addClass(element, className) {
  if (element && className) {
    element.classList.add(className);
  }
}

/**
 * Remove CSS class safely
 * @param {Element} element - Target element
 * @param {string} className - Class name to remove
 */
export function removeClass(element, className) {
  if (element && className) {
    element.classList.remove(className);
  }
}

/**
 * Toggle CSS class safely
 * @param {Element} element - Target element
 * @param {string} className - Class name to toggle
 * @param {boolean} [force] - Force add/remove
 * @returns {boolean} New class state
 */
export function toggleClass(element, className, force) {
  if (element && className) {
    return element.classList.toggle(className, force);
  }
  return false;
}

/**
 * Create element with attributes
 * @param {string} tagName - Element tag name
 * @param {Object} [attributes={}] - Element attributes
 * @param {string|Element|Element[]} [children] - Child content
 * @returns {Element} Created element
 */
export function createElement(tagName, attributes = {}, children = null) {
  const element = document.createElement(tagName);

  Object.entries(attributes).forEach(([key, value]) => {
    if (key === "className") {
      element.className = value;
    } else if (key === "style" && typeof value === "object") {
      Object.assign(element.style, value);
    } else if (key.startsWith("on") && typeof value === "function") {
      element.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      element.setAttribute(key, value);
    }
  });

  if (children) {
    if (typeof children === "string") {
      element.textContent = children;
    } else if (Array.isArray(children)) {
      children.forEach((child) => element.appendChild(child));
    } else if (children instanceof Element) {
      element.appendChild(children);
    }
  }

  return element;
}

/**
 * Debounce function execution
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function execution
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
