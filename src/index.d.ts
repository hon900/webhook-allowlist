import type { CheckResult, HostfencePolicy } from "hostfence";

export { HostfenceError } from "hostfence";

export interface WebhookGuard {
  /** A malformed URL still throws HostfenceError. */
  check(callbackUrl: string | URL): Promise<CheckResult>;
  validate(callbackUrl: string | URL): Promise<URL>;
}

/** URL credentials are always rejected, including when allowCredentials is true. */
export declare function createWebhookGuard(options?: HostfencePolicy): WebhookGuard;
