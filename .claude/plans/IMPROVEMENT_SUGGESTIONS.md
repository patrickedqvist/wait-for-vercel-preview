# Improvement Suggestions for wait-for-vercel-preview

### 1. Add TypeScript Support
Convert to TypeScript for better type safety and developer experience. The `// @ts-check` comment suggests you already want type checking - TypeScript would provide full support.

### 2. Add Input Validation
Validate numeric inputs more strictly:
```javascript
const MAX_TIMEOUT = Number(core.getInput('max_timeout'));
if (isNaN(MAX_TIMEOUT) || MAX_TIMEOUT <= 0) {
  core.setFailed('max_timeout must be a positive number');
}
```

### 3. Add Retry Configuration as Inputs
Currently `waitForDeploymentToStart` uses hardcoded `maxTimeout: 20`. Consider making this configurable via a new input like `deployment_start_timeout`.

### 4. Improve Error Messages
Include more context in error messages:
- Include the SHA when deployment is not found
- Include environment name when no deployment matches
- Log the actual status state when it's not "success"

### 5. Add Exponential Backoff
Instead of fixed interval polling, implement exponential backoff to be more respectful of API rate limits:
```javascript
const backoff = Math.min(baseInterval * Math.pow(1.5, attempt), maxInterval);
```

### 6. Add Debug Logging
Use `core.debug()` for verbose logging that users can enable:
```javascript
core.debug(`Checking deployment status for SHA: ${sha}`);
```

### 7. Improve the `vercel_protection_bypass_header` Handling
Currently if both `vercel_password` and `vercel_protection_bypass_header` are provided, the bypass header overwrites the cookie header. Consider combining them or documenting mutual exclusivity.

### 8. Add Workflow Dispatch Support
Document or add support for `workflow_dispatch` events by accepting an optional `sha` input for manual runs.

### 9. Add Timeout Warning
Warn users when they're approaching the timeout limit (e.g., at 80% of max_timeout).

### 10. Consider Using `@octokit/action`
The `@octokit/action` package is purpose-built for GitHub Actions and handles auth automatically.
