# OAuth Broker (Concept Landing)

The OAuth broker now runs inside the `concept-landing` server. All broker routes live under `/rework/oauth` and share the same host/port as the landing site.

## Endpoints

Routes:
- `GET /rework/oauth/callback`
- `POST /rework/oauth/start`
- `POST /rework/oauth/handoff`
- `POST /rework/oauth/refresh`

## Environment

Required to enable the broker:
- `PUBLIC_CALLBACK_URL` (must end with `/rework/oauth/callback`)

Optional:
- `BROKER_API_KEY` (shared secret for POST routes)
- `MCP_SLACK_URL` (default `https://mcp.slack.com/mcp`)
- `MCP_NOTION_URL` (default `https://mcp.notion.com/mcp`)

Provider secrets:
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- `MCP_SLACK_CLIENT_ID`, `MCP_SLACK_CLIENT_SECRET`
- `MCP_NOTION_CLIENT_ID`, `MCP_NOTION_CLIENT_SECRET`

If `PUBLIC_CALLBACK_URL` is not set, the landing site still runs, but the broker endpoints return `503`.

## Local testing

Set the callback URL for HTTPS (use a local tunnel or mkcert):

```
export PUBLIC_CALLBACK_URL=https://localhost:5173/rework/oauth/callback
export PORT=5173
npm run dev
```

## Desktop app config

Set these env vars for the Electron app:

- `REWORK_OAUTH_BROKER_URL` (example: `https://www.concept.dev/rework/oauth`)
- `REWORK_OAUTH_BROKER_API_KEY` (optional, if `BROKER_API_KEY` is set)
