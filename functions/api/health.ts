export async function onRequestGet() {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  };

  return new Response(
    JSON.stringify({
      status: "ok",
      service: "LANGRATIA Edge Backend API",
      environment: "production",
      timestamp: new Date().toISOString(),
    }),
    { status: 200, headers }
  );
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
