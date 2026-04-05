# Deployment Guide

This guide documents how ImplPlanViewer deploys to GitHub Pages and which events trigger rebuilds.

## Workflow Files

- `.github/workflows/build-and-deploy.yml`
- `.github/workflows/manual-rebuild.yml`

## GitHub Pages Setup

1. Open **Repository Settings → Pages**.
2. Set **Source** to **GitHub Actions**.
3. Ensure the default branch is `main`.
4. Confirm Actions are enabled for the repository.

`build-and-deploy.yml` already configures required permissions:
- `contents: read`
- `pages: write`
- `id-token: write`

## Required Secrets and Variables

### Secrets
- `GH_PAT` (optional but recommended for private/cross-repo access)
- `GITHUB_TOKEN` is provided automatically by GitHub Actions

### Repository Variables (optional)
- `IMPLPLAN_ORG` (defaults to repository owner)
- `IMPLPLAN_TOPIC` (defaults to `impl-plan-viewer`)
- `IMPLPLAN_DISCOVERY_MODE` (`topic` or `org`, defaults to `topic`)

## Build-and-Deploy Trigger Matrix

`build-and-deploy.yml` runs on:

1. **Push to `main`** when files change in:
   - `plan-viewer/**`
   - `scripts/**`
   - `.github/workflows/build-and-deploy.yml`

2. **Repository dispatch** with types:
   - `plans_updated`
   - `manual_rebuild`

3. **Manual workflow dispatch** with inputs:
   - `force_full_rebuild` (boolean)
   - `specific_repo` (`owner/name`, optional)

## Triggering Rebuilds

### A) From source repositories (automatic)

Use `repository_dispatch` to notify this repo when `implementation-plans/**` changes:

```bash
curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer <PLAN_VIEWER_TOKEN>" \
  https://api.github.com/repos/JuniMods/ImplPlanViewer/dispatches \
  -d '{"event_type":"plans_updated","client_payload":{"repository":"owner/repo"}}'
```

### B) Manual rebuild workflow

Run **Manual Rebuild** (`manual-rebuild.yml`) from the Actions UI.

- `specific_repo` is validated to match `owner/name`
- The workflow dispatches `build-and-deploy.yml` with the chosen inputs

### C) Direct manual build-and-deploy run

Run **Build and Deploy** directly via Actions UI with optional inputs.

## Pipeline Stages (build-and-deploy)

1. **Discover Repositories**
   - Runs `scripts/discover-repositories.js`
   - Publishes `discovery.json` artifact

2. **Fetch & Parse Plans** (matrix per repository)
   - Runs `scripts/fetch-plans.js`
   - Runs `scripts/parse-plans.js`
   - Publishes `parsed-<repo-id>` artifacts

3. **Build Vue Application**
   - Builds `manifest-input.json`
   - Runs `scripts/generate-manifests.js`
   - Runs `scripts/validate-manifests.js`
   - Installs `plan-viewer` dependencies and builds app
   - Uploads Pages artifact from `plan-viewer/dist`

4. **Deploy to GitHub Pages**
   - Uses `actions/deploy-pages@v4`
   - Publishes to the `github-pages` environment

## Failure/Edge-Case Notes

- If no repositories are discovered, fetch/parse matrix is skipped and build continues with discovered metadata.
- If `specific_repo` is invalid, `manual-rebuild.yml` fails early at input validation.
- If manifest validation fails, deployment stops before Pages upload.
- Repository visibility/token scope issues usually surface during discover/fetch steps.

## Quick Verification Checklist

After changing workflows or scripts:

1. Trigger `build-and-deploy.yml` with `workflow_dispatch`.
2. Verify all jobs complete successfully.
3. Confirm Pages environment URL is produced in deploy job output.
4. Open the deployed site and verify repository list + plan detail pages render.
