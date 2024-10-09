class JSONResponse extends Response {
  constructor(body?: Record<string, unknown>, init?: ResponseInit) {
    super(JSON.stringify(body, null, 2), {
      ...init,
      headers: {
        ...init?.headers,
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);
    const [org, id] = url.pathname.split("/").filter(String).slice(0, 2);

    if (org && id && request.method === "GET") {
      const { results } = await env.DB.prepare(
        "SELECT emoji, COUNT(emoji) as count FROM reactions WHERE org = ? AND instanceId = ? GROUP BY emoji ORDER BY createdAt"
      )
        .bind(org, id)
        .all<Record<string, number>>();
      const out = results.reduce<Record<string, { count: number }>>(
        (acc, el) => ({
          ...acc,
          [el.emoji]: { count: el.count },
        }),
        {}
      );
      return new JSONResponse(out);
    }

    if (org && id && request.method === "POST") {
      const payload = await request.json<{
        action: string;
        emoji: string;
        userId: string;
      }>();
      if (payload.action === "increment") {
        const sql = `INSERT INTO reactions (org, instanceId, emoji, userId) VALUES (?, ?, ?, ?)`;
        await env.DB.prepare(sql)
          .bind(org, id, payload.emoji, payload.userId ?? "")
          .all();
      }
      if (payload.action === "decrement") {
        const sql = `DELETE FROM reactions WHERE id = (SELECT MAX(id) FROM reactions WHERE org = ? AND instanceId = ? AND emoji = ? AND userId = ?)`;
        await env.DB.prepare(sql)
          .bind(org, id, payload.emoji, payload.userId)
          .run();
      }
      return new JSONResponse({ success: true });
    }

    return new JSONResponse({ error: "Not found." }, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
