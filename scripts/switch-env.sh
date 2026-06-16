#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CLASP_FILE="$REPO_DIR/.clasp.json"

usage() {
  echo "Usage: $0 <env> [options]"
  echo ""
  echo "Environments:"
  echo "  prod    Switch to production (uses .clasp.prod.json)"
  echo "  test    Switch to testing (uses .clasp.test.json)"
  echo ""
  echo "Options:"
  echo "  --push-only    Switch env and push to Apps Script (no deploy)"
  echo "  --deploy       Switch env, push, and deploy"
  echo "  --deploy-desc  Description for deployment (used with --deploy)"
  echo ""
  echo "Examples:"
  echo "  $0 prod                  # Just switch .clasp.json to production"
  echo "  $0 test --push-only      # Switch to test and push"
  echo "  $0 prod --deploy         # Switch to prod, push and deploy"
  echo "  $0 test --deploy --deploy-desc 'Testing v2'"
  exit 1
}

if [ $# -lt 1 ]; then
  usage
fi

ENV="$1"
shift

PUSH_ONLY=false
DEPLOY=false
DEPLOY_DESC=""

while [ $# -gt 0 ]; do
  case "$1" in
    --push-only) PUSH_ONLY=true ;;
    --deploy) DEPLOY=true ;;
    --deploy-desc) DEPLOY_DESC="$2"; shift ;;
    *) echo "Unknown option: $1"; usage ;;
  esac
  shift
done

case "$ENV" in
  prod)
    SOURCE="$REPO_DIR/.clasp.prod.json"
    ENV_LABEL="PRODUCTION"
    ;;
  test)
    SOURCE="$REPO_DIR/.clasp.test.json"
    ENV_LABEL="TESTING"
    ;;
  *)
    echo "Unknown environment: $ENV"
    echo "Use 'prod' or 'test'"
    usage
    ;;
esac

if [ ! -f "$SOURCE" ]; then
  echo "ERROR: $SOURCE not found"
  exit 1
fi

if grep -q 'TODO_REPLACE_WITH_TEST_SCRIPT_ID' "$SOURCE" 2>/dev/null; then
  echo "ERROR: .clasp.test.json still has a placeholder scriptId."
  echo "Create a testing Apps Script project first and update .clasp.test.json with the real scriptId."
  echo ""
  echo "Steps:"
  echo "  1. mkdir /tmp/school-data-test && cd /tmp/school-data-test"
  echo "  2. clasp create --title 'School Data App - Testing'"
  echo "  3. Copy the scriptId from the new .clasp.json"
  echo "  4. Update .clasp.test.json in this repo with the real scriptId"
  exit 1
fi

cp "$SOURCE" "$CLASP_FILE"
echo "Switched to $ENV_LABEL environment (clid: $(jq -r .scriptId "$CLASP_FILE" 2>/dev/null || echo 'unknown'))"

if [ "$PUSH_ONLY" = true ]; then
  echo "Pushing to Apps Script..."
  cd "$REPO_DIR" && clasp push
  echo "Push complete for $ENV_LABEL"
fi

if [ "$DEPLOY" = true ]; then
  echo "Pushing to Apps Script..."
  cd "$REPO_DIR" && clasp push

  if [ -n "$DEPLOY_DESC" ]; then
    echo "Deploying with description: $DEPLOY_DESC..."
    cd "$REPO_DIR" && clasp deploy --description "$DEPLOY_DESC"
  else
    echo "Deploying..."
    cd "$REPO_DIR" && clasp deploy --description "$ENV_LABEL deployment $(date +%Y%m%d-%H%M%S)"
  fi
  echo "Deploy complete for $ENV_LABEL"
fi

echo ""
echo "Current environment: $ENV_LABEL"
if [ "$PUSH_ONLY" = false ] && [ "$DEPLOY" = false ]; then
  echo "No push/deploy requested. .clasp.json is ready for manual 'clasp push' or 'clasp deploy'."
fi