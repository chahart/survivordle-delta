export const config = {
  matcher: "/((?!_next|api|.*\\.[\\w]+$).*)",
};

const BB_TITLE = "Big Brotherdle: Daily Big Brother Houseguest Guessing Game";
const BB_DESCRIPTION = "Guess the Big Brother houseguest in 8 tries. New puzzle every day: match by season, comp wins, placement, age, and more.";
const BB_IMAGE = "https://survivordle.com/Big_Brotherdle_Thumbnail.png";

export default async function middleware(request) {
  const url = new URL(request.url);
  const isBB = url.pathname === "/bb" || url.pathname.startsWith("/bb/");
  if (!isBB) return;

  const response = await fetch(new URL("/index.html", url));
  let html = await response.text();

  html = html
    .replace(
      /<title>.*?<\/title>/,
      `<title>${BB_TITLE}</title>`
    )
    .replace(
      /<meta name="description" content=".*?" \/>/,
      `<meta name="description" content="${BB_DESCRIPTION}" />`
    )
    .replace(
      /<meta property="og:title" content=".*?" \/>/,
      `<meta property="og:title" content="${BB_TITLE}" />`
    )
    .replace(
      /<meta property="og:description" content=".*?" \/>/,
      `<meta property="og:description" content="${BB_DESCRIPTION}" />`
    )
    .replace(
      /<meta property="og:url" content=".*?" \/>/,
      `<meta property="og:url" content="https://survivordle.com${url.pathname}" />`
    )
    .replace(
      /<meta property="og:image" content=".*?" \/>/,
      `<meta property="og:image" content="${BB_IMAGE}" />`
    )
    .replace(
      /<meta name="twitter:title" content=".*?" \/>/,
      `<meta name="twitter:title" content="${BB_TITLE}" />`
    )
    .replace(
      /<meta name="twitter:description" content=".*?" \/>/,
      `<meta name="twitter:description" content="${BB_DESCRIPTION}" />`
    )
    .replace(
      /<meta name="twitter:image" content=".*?" \/>/,
      `<meta name="twitter:image" content="${BB_IMAGE}" />`
    )
    .replace(
      /<link rel="canonical" href=".*?" \/>/,
      `<link rel="canonical" href="https://survivordle.com${url.pathname}" />`
    );

  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
