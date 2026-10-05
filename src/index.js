import { Hostfence, HostfenceError } from "hostfence";

export { HostfenceError };

export function createWebhookGuard(options = {}) {
  const fence = new Hostfence({ ...options, allowCredentials: false });

  async function check(callbackUrl) {
    const result = await fence.check(callbackUrl);
    // Keep the webhook credential rule when used with older hostfence releases.
    if (result.ok && (result.url.username || result.url.password)) {
      return { ...result, ok: false, reasons: ["credentials in webhook URL"] };
    }
    return result;
  }

  return {
    check,
    async validate(callbackUrl) {
      const result = await check(callbackUrl);
      if (!result.ok) {
        throw new HostfenceError(result.url.toString(), result.reasons);
      }
      return result.url;
    },
  };
}
