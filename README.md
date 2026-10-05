# webhook-allowlist

```sh
npm install github:hon900/webhook-allowlist#v2.1.0
```

Validate outbound webhook callback URLs with
[hostfence](https://github.com/hon900/hostfence) before delivery. The guard checks
hostnames and resolved addresses and always rejects URL credentials. It does not
send webhooks. Requires Node.js 18.18 or later.

```js
import { createWebhookGuard, HostfenceError } from "webhook-allowlist";

const guard = createWebhookGuard({
  protocols: ["https"],
  allowedHosts: ["hooks.example.com"],
  extraDeniedCidrs: ["203.0.113.0/24"],
});

const callback = await guard.validate("https://hooks.example.com/events");
// Validate again immediately before each delivery attempt.
await fetch(callback, {
  method: "POST",
  redirect: "error",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ event: "example" }),
  signal: AbortSignal.timeout(5_000),
});
```

## API

`createWebhookGuard(policy?)` accepts the full hostfence policy, including protocol
restrictions, allow/deny host lists, additional denied CIDRs, and a custom DNS
lookup. Credentials in callback URLs remain forbidden even if a supplied policy
sets `allowCredentials: true`.

- `await guard.validate(url)` returns the normalized `URL` or throws
  `HostfenceError` with `code` and `reasons`.
- `await guard.check(url)` returns `{ ok, url, hostname, addresses, reasons }` for
  a valid URL, including when it is blocked. Malformed URLs still throw
  `HostfenceError` with code `HOSTFENCE_INVALID_URL`.

Both methods accept strings and `URL` objects. Host allowlists are exact matches;
an allowlisted hostname does not bypass private-address checks. TypeScript
declarations are included.

```js
const decision = await guard.check("https://hooks.example.com/events");
if (!decision.ok) {
  // Return an appropriate validation error to the caller.
  console.error(decision.reasons);
}
```

## Delivery boundary

Validate at callback registration and again immediately before every delivery or
retry; storing a successful registration check does not make a URL safe forever.
Disable automatic redirects in the delivery client. If redirects are supported,
validate each new destination and avoid forwarding secrets across origins.

This is a **preflight check**. A separate delivery client's DNS resolution is not
bound to the addresses checked by the guard. DNS changes between validation and
connection remain a time-of-check/time-of-use risk. Use destination-restricted
egress or a transport that binds the validated address to the actual connection
when accepting hostile callback URLs.

Retries, signatures, HTTP status handling, timeouts, and response limits belong to
the delivery system. Treat callback query strings and error details as potentially
sensitive when logging.

## Development

```sh
npm install
npm test
```

Tests use literal IPs or injected DNS answers and make no external requests.
This release pins `github:hon900/hostfence#v1.3.0`.
A local sibling hostfence build can be linked for integration checks.
