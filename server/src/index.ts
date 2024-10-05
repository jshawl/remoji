interface Env {
  DB: D1Database;
}

class JSONResponse extends Response {
  constructor(body: Record<string, unknown>, init?: ResponseInit) {
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

const response: Record<string, Record<string, number>> = {
  "😄": { count: 2 },
};

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);
    const [org, id] = url.pathname.split("/").filter(String).slice(0, 2);

    if (org && id && request.method === "GET") {
      const { results } = await env.DB.prepare(
        "SELECT * FROM reactions WHERE org = ? AND instanceId = ?"
      )
        .bind(org, id)
        .all<Record<string, number>>();
      const out = results.reduce<Record<string, { count: number }>>(
        (acc, el) => {
          acc[el.emoji] = { count: el.count };
          return acc;
        },
        {}
      );
      return new JSONResponse(out);
    }

    if (org && id && request.method === "POST") {
      const payload = await request.json<{ action: string; emoji: string }>();
      if (payload.action === "increment") {
        response[payload.emoji] ??= { count: 0 };
        response[payload.emoji].count++;
      }
      if (payload.action === "decrement") {
        if (response[payload.emoji]) {
          response[payload.emoji].count--;
        }
        if (response[payload.emoji]?.count === 0) {
          delete response[payload.emoji];
        }
      }
      return new JSONResponse(response);
    }

    return new JSONResponse({ error: "Not found." }, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
