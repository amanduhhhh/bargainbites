// Legacy placeholder: Routes are mounted by Auth0 middleware under /auth/* in v4.
// This route group is intentionally not used. Return 404 for any access.
export async function GET() {
  return new Response("Not Found", { status: 404 });
}

export async function POST() {
  return new Response("Not Found", { status: 404 });
}
