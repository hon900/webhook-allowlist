import { Hostfence, HostfenceError } from "hostfence";

export { HostfenceError };

export function createWebhookGuard(options = {}) {
  const fence = new Hostfence({
    allowedHosts: options.allowedHosts,
    extraDeniedHosts: options.extraDeniedHosts,
  });

  return {
    async validate(callbackUrl) {
      const url = await fence.assert(callbackUrl);
      if (url.username || url.password) {
        throw new HostfenceError(url.toString(), ["credentials in webhook URL"]);
      }
      return url;
    },
  };
}
