# Wait for Vercel Preview — A GitHub Action ⏱

Do you have other Github actions (Lighthouse, Cypress, etc) that depend on the Vercel Preview URL? This action will wait until the url is available before running the next task.

Please note that this action is supposed to be run on the `pull_request` or `push` events.

## Inputs

### `token` (Required)

The github secret `${{ secrets.GITHUB_TOKEN }}`

### `environment`

Optional — The name of the environment that was deployed to (e.g., Preview, staging or production). Defaults to 'Preview'.

### `deployment_creator_name`

Optional — The name of the user who created the deployment. Defaults to 'vercel[bot]'.

### `vercel_protection_bypass_secret`

Optional — Vercel protection bypass for automation.

### `allow_inactive`

Optional — Use the most recent inactive deployment (previously deployed preview) associated with the pull request if no new deployment is available.

### `path`

Optional — The relative path to run the health check on, useful if you want to check a specific route. Defaults to ''.

### `max_attempts`

Optional — The number of retry attempts for each stage (1. lookup PR, 2. find deployment, 3. lookup deployment status, 4. health check) to do before failing. Defaults to '20'.

### `retry_interval`

Optional — The number of seconds to wait between retry attempts. Defaults to '30'.

### `max_timeout` (Deprecated)

Optional — The max time to run the action. This input is deprecated and will be removed in a future release. Please use `max_attempts` & `retry_interval` instead.

### `check_interval` (Deprecated)

Optional — How often (in seconds) should we make the HTTP request checking to see if the deployment is available? This input is deprecated and will be removed in a future release. Please use `max_attempts` & `retry_interval` instead.

### `vercel_password` (Deprecated)

Optional — Vercel password protection secret. This input is deprecated and will be removed in a future release. Please use `vercel_protection_bypass_secret` instead.

### `vercel_protection_bypass_header` (Deprecated)

Optional — Vercel protection bypass for automation. This input is deprecated and will be removed in a future release. Please use `vercel_protection_bypass_secret` instead.

## Necessary Privileges

To use this action, you need to ensure that your GitHub workflow has the necessary permissions to interact with the GitHub API and access deployment information. Here's what you need to do:

1. **GitHub Token**: The action requires the `GITHUB_TOKEN` secret to authenticate API requests. This token is automatically provided by GitHub Actions, but you need to pass it explicitly to the action.

2. **Permissions**: Your workflow needs `read` permissions for `pull-requests` and `deployments`. You can either provide the `GITHUB_TOKEN` by changing the repository settings for actions or set fine-grained permissions in the workflow file.

You can set these permissions in your workflow file like this:

```yaml
permissions:
  pull-requests: read
  deployments: read
```

By setting up these permissions correctly, you allow the action to fetch information about pull requests and deployments, which is crucial for its operation.

Read more at [Controlling permissions for GITHUB_TOKEN](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/controlling-permissions-for-github_token)

## Outputs

### `url`

The vercel deploy preview url that was deployed.

### `vercel_jwt` (Deprecated)
This is no longer available. If accessing a password protected site, the JWT from the login event. This can be passed on to e2e tests, for instance.

## Example usage

Basic Usage

```yaml
steps:
  - name: Health check vercel deployment
    uses: patrickedqvist/wait-for-vercel-preview@v2
    id: healthCheck
    with:
      token: ${{ secrets.GITHUB_TOKEN }}
      max_attempts: 20
  # access preview url
  - run: echo ${{steps.healthCheck.outputs.url}}
```

## Building

The Action is bundled via [ncc](https://github.com/vercel/ncc). See [this discussion](https://github.com/actions/hello-world-javascript-action/issues/12) for more information.

```sh
pnpm run build
# outputs the build to dist/index.js
```

## Tests

Unit tests with [Vitest](https://vitest.dev/) and [Mock Service Worker](https://mswjs.io/)

```
pnpm test
```

## Upgrading from Version 1.x to Version 2.x

For users transitioning from Version 1.x to Version 2.0, we've made several improvements and changes to enhance your experience. This section will guide you through the key differences and help you make a smooth transition.

### Key Changes:

1. Deprecated Inputs: Several inputs have been deprecated and will be removed in future releases:
   - `max_timeout`: Use `max_attempts` & `retry_interval` instead.
   - `check_interval`: Use `max_attempts` & `retry_interval` instead.
   - `vercel_password`: Use `vercel_protection_bypass_secret` instead.
   - `vercel_protection_bypass_header`: Use `vercel_protection_bypass_secret` instead.

2. New Inputs:
   - `max_attempts`: The number of retry attempts for each stage.
   - `retry_interval`: The number of seconds to wait between retry attempts.
   - `vercel_protection_bypass_secret`: Vercel protection bypass for automation.
   - `allow_inactive`: Use the most recent inactive deployment if no new deployment is available.
   - `path`: The relative path to run the health check on.
   - `deployment_creator_name`: The name of the user who created the deployment. Defaults to 'vercel[bot]'.

3. Removed Outputs:
   - `vercel_jwt`: This output is no longer available.

4. Environment Naming: The `environment` input now defaults to 'Preview' instead of 'Production'.

5. Clarified logging. It now clearly seperates the differente steps in "stages". Where stage one is looking up the PR, stage two is finding the deployment, stage three is looking up the deployment status and stage four is the health check.

Upgrade Process:

1. Update your workflow YAML file to use the new input names and remove deprecated ones.
2. Adjust your retry logic using `max_attempts` and `retry_interval` instead of `max_timeout` and `check_interval`.
3. If you were using `vercel_password` or `vercel_protection_bypass_header`, switch to `vercel_protection_bypass_secret`.
4. Remove any references to the `vercel_jwt` output in your workflow.
5. Review the new inputs to see if they can benefit your workflow.

Example of updated usage:

```yaml
steps:
  - name: Health check vercel deployment
    uses: patrickedqvist/wait-for-vercel-preview@v2
    id: healthCheck
    with:
      token: ${{ secrets.GITHUB_TOKEN }}
      max_attempts: 20
      retry_interval: 30
  # access preview url
  - run: echo ${{steps.healthCheck.outputs.url}}
```

If you encounter any issues during or after the upgrade, please refer to the full documentation or open an issue on the GitHub repository.
