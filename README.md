# Wait for Vercel Preview — A GitHub Action ⏱

Do you have other Github actions (Lighthouse, Cypress, etc) that depend on the Vercel Preview URL? This action will wait until the url is available before running the next task.

Please note that this action is supposed to be run on the `pull_request` event.

## Inputs

### `token` (Required)

The github secret `${{ secrets.GITHUB_TOKEN }}`

### `environment`

Optional — The name of the environment that was deployed to (e.g., staging or production)

### `max_timeout`

Optional — The amount of time  in seconds to spend waiting for this action to complete. When this time runs out, the action is automatically failed. It is strongly recommended that this is set to 3x the average deployment time. Defaults to `60` seconds.

### `vercel_polling_interval`

Optional — The polling period for Vercel's preview link. Defaults to `20` seconds.

### `github_polling_interval`

Optional — The polling period for checking on deployments and deployment status from Github. It is strongly recommended that this is set to ~ 1/10th of the average deployment time. Defaults to `20` seconds.

### `allow_inactive`

Optional - Use the most recent inactive deployment (previously deployed preview) associated with the pull request if
 no new deployment is available. Defaults to `false`.

## Outputs

### `url`

The vercel deploy preview url that was deployed.

## Example usage

Basic Usage

```yaml
steps:
  - name: Waiting for 200 from the Vercel Preview
    uses: patrickedqvist/wait-for-vercel-preview@master
    id: waitFor200
    with:
      token: ${{ secrets.GITHUB_TOKEN }}
      max_timeout: 60
  # access preview url
  - run: echo ${{steps.waitFor200.outputs.url}}

```
