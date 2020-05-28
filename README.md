# Wait for Vercel Preview — A GitHub Action ⏱

Do you have other Github actions (Lighthouse, Cypress, etc) that depend on the Vercel Preview URL? This action will wait until the url is available before running the next task.

## Inputs

### `token`

**Required** The github secret `${{ secrets.GITHUB_TOKEN }}`

### `max_timeout`

Optional — The amount of time to spend waiting on Vercel. Defaults to `60` seconds

## Outputs

### `url`

The netlify deploy preview url that was deployed.

## Example usage

Basic Usage

```yaml
steps:
  - name: Waiting for 200 from the Vercel Preview
    uses: patrickedqvist/wait-for-vercel-preview@v1
    id: waitFor200
    with:
      token: ${{ secrets.GITHUB_TOKEN }}
      max_timeout: 60
```