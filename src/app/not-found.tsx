// Fallback for requests that never reach a locale (e.g. /unknown.xyz).
export default function GlobalNotFound() {
  return (
    <html lang="hr">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#F5F1E8", color: "#222522", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0 }}>
        <main style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontWeight: 500 }}>404</h1>
          <p>Stranica nije pronađena · Page not found</p>
          <p><a href="/hr">Atlas hrvatskih vinarija</a> · <a href="/en">Croatian Wine Atlas</a></p>
        </main>
      </body>
    </html>
  );
}
