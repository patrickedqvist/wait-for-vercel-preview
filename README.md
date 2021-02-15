# Wait for Vercel Preview — A GitHub Action ⏱

Do you have other Github actions (Lighthouse, Cypress, etc) that depend on the Vercel Preview URL? This action will wait until the url is available before running the next task.

Please note that this action is supposed to be run on the `pull_request` event.

## Inputs

### `token` (Required)

The github secret `${{ secrets.GITHUB_TOKEN }}`

### `environment`

Optional — The name of the environment that was deployed to (e.g., staging or production)

### `max_timeout`

Optional — The amount of time to spend waiting on Vercel. Defaults to `60` seconds

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
  - name: Waiting for Vercel Preview
    uses: patrickedqvist/wait-for-vercel-preview@master
    id: waitForPreview
    with:
      token: ${{ secrets.GITHUB_TOKEN }}
      max_timeout: 300
  # access preview url
  - run: echo ${{steps.waitForPreview.outputs.url}}

```
