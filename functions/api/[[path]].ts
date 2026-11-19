import { handle } from "../../server/api";
import type { Env } from "../../server/util";

/** Every /api/* request goes to the marketplace router in server/api.ts. */
export const onRequest: PagesFunction<Env> = ({ request, env, params }) => {
  const path = Array.isArray(params.path) ? params.path : params.path ? [params.path] : [];
  return handle(request, env, path);
};
