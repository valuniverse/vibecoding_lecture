export async function GET() {
  return Response.json({
    ok: true,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  })
}
