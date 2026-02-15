/**
 * Issue Reporter Module
 * Generates pre-filled GitHub issue links for reporting broken selectors
 */

const REPO_URL =
  "https://github.com/tom-james-watson/old-reddit-redirect/issues/new";

/**
 * Open the issue reporter with pre-filled details
 * @param {string} type - 'selector' or 'bug'
 * @param {Object} details - Contextual details
 */
export function openIssueReporter(type = "bug", details = {}) {
  const params = new URLSearchParams();

  if (type === "selector") {
    params.set("labels", "broken-selector");
    params.set(
      "title",
      `[Selector] Broken selector on ${details.pageType || "unknown page"}`
    );
    params.set("body", generateSelectorTemplate(details));
  } else {
    params.set("labels", "bug");
    params.set("body", generateBugTemplate(details));
  }

  const url = `${REPO_URL}?${params.toString()}`;
  window.open(url, "_blank");
}

function generateSelectorTemplate(details) {
  return `
**Page Type**: ${details.pageType || "e.g. Comments, Subreddit, Frontpage"}
**Url**: ${details.url || "N/A"}

**Description of breakage**:
<!-- Describe what visual element is broken -->

**Suggested Fix (optional)**:
\`\`\`css
/* Paste working selector here if known */
\`\`\`

**Environment**:
- OS: ${navigator.platform}
- User Agent: ${navigator.userAgent}
`;
}

function generateBugTemplate(_details) {
  return `
**Description**:
<!-- Describe the bug -->

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Behavior**:


**Actual Behavior**:


**Environment**:
- OS: ${navigator.platform}
- User Agent: ${navigator.userAgent}
`;
}
