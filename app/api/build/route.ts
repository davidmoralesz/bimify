import { getRequestContext } from "@cloudflare/next-on-pages"

export const runtime = "edge"

export async function GET() {
  const BUILD_CONFIG = getRequestContext().env.BUILD_CONFIG
  const MAX_FILE_COUNT = await BUILD_CONFIG.get("MAX_FILE_COUNT")
  return new Response(MAX_FILE_COUNT)
}
