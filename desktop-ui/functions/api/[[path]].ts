// Cloudflare Pages Function proxying /api/* requests to Render backend
export const onRequest = async (context: { request: Request }) => {
  const url = new URL(context.request.url);
  const target = `https://janeconverter-web.onrender.com${url.pathname}${url.search}`;

  const headers = new Headers(context.request.headers);
  headers.delete("host");

  const init: RequestInit = {
    method: context.request.method,
    headers,
    redirect: "follow",
  };

  if (!["GET", "HEAD"].includes(context.request.method)) {
    init.body = context.request.body;
    // @ts-ignore
    init.duplex = "half";
  }

  return fetch(target, init);
};
