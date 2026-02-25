.PHONY: build build-ssr build-all serve deploy clean type-check test storybook

# ── Build ───────────────────────────────────────────────────────────

## Build all client-side view HTML bundles
build:
	pnpm run build

## Build the universal SSR module (packages/ssr)
build-ssr:
	pnpm run build:ssr

## Build everything: client HTML + SSR + storybook
build-all: build build-ssr
	pnpm run build-storybook

# ── Run ─────────────────────────────────────────────────────────────

## Start local server on port 8000
serve:
	node server.mjs

## Deploy to Fly.io
deploy:
	fly deploy --app chuk-mcp-ui-views

## Build client + SSR then deploy
ship: build build-ssr deploy

# ── Development ─────────────────────────────────────────────────────

## Run type-check across all packages
type-check:
	pnpm run type-check

## Run all tests
test:
	pnpm run test

## Start Storybook dev server
storybook:
	pnpm run storybook

## Clean all build artifacts
clean:
	pnpm run clean
	rm -rf packages/ssr/dist

# ── Helpers ─────────────────────────────────────────────────────────

## Build a single view: make view NAME=counter
view:
	pnpm --filter @chuk/view-$(NAME) build

## Check deploy health
health:
	@curl -s https://chuk-mcp-ui-views.fly.dev/health | node -e "\
		const j=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));\
		console.log('Status:', j.status);\
		console.log('Views:', j.views.length);\
		console.log('SSR:', j.ssr.length);"

## Test SSR rendering remotely: make test-ssr VIEW=counter DATA='{"value":42}'
test-ssr:
	@curl -s -X POST https://chuk-mcp-ui-views.fly.dev/$(VIEW)/v1/ssr \
		-H 'Content-Type: application/json' \
		-d '{"data":$(DATA)}' | head -c 500
	@echo ""

## Show Fly.io status
status:
	fly status --app chuk-mcp-ui-views

## Show Fly.io logs
logs:
	fly logs --app chuk-mcp-ui-views
