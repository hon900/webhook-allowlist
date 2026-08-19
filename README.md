# webhook-allowlist

Outbound webhook delivery helper. Callback URLs are checked with
[hostfence](https://github.com/hon900/hostfence) so a tenant cannot point
payments or alerts at IMDS, RFC1918, or localhost.

```js
import { createWebhookGuard } from "webhook-allowlist";

const guard = createWebhookGuard({ allowedHosts: ["hooks.example.com"] });
await guard.validate(req.body.callback_url);
```

Depends on `github:hon900/hostfence#v1.2.0`.
