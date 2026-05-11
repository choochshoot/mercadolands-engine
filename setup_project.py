import os



BASE = "landing-saas"

files = {
    "index.html": """<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Landing SaaS</title>
</head>
<body>
<h1>Proyecto listo 🚀</h1>
<p>Usa /u/index.html?slug=daniela</p>
</body>
</html>
""",

    "404.html": """<script>
const path = window.location.pathname;
const slug = path.split("/").pop();
window.location.href = "/u/index.html?slug=" + slug;
</script>
""",

    "config.js": """const CONFIG = {
  SUPABASE_URL: "https://TU_PROJECT.supabase.co",
  SUPABASE_KEY: "TU_ANON_KEY"
};
""",

    "app.js": """const supabaseClient = supabase.createClient(
  CONFIG.SUPABASE_URL,
  CONFIG.SUPABASE_KEY
);

function getSlug() {
  const params = new URLSearchParams(window.location.search);
  return params.get("slug");
}

async function loadLanding() {
  const slug = getSlug();

  if (!slug) {
    document.getElementById("app").innerHTML = "Sin slug";
    return;
  }

  const { data, error } = await supabaseClient
    .from("landings")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    document.getElementById("app").innerHTML = "No encontrado";
    return;
  }

  render(data.data);
}

function render(d) {
  document.getElementById("app").innerHTML = `
  <div class="wrapper">

    <div class="phone">
      <div class="screen">

        <div class="content">
          <div class="left">
            <h1>${d.name}</h1>
            <p>${d.title}</p>
            <p>${d.message}</p>
          </div>

          <div class="right">
            <img src="${d.image}" style="width:100%">
          </div>
        </div>

        <div class="buttons">
          ${d.buttons.map(b => `
            <a href="${b.link}" target="_blank" class="btn ${b.type}">
              ${b.label}
            </a>
          `).join("")}
        </div>

        <p>${d.about}</p>

      </div>
    </div>

  </div>
  `;
}

loadLanding();
""",

    "style.css": """body{
  font-family:sans-serif;
  background:#eee;
  margin:0;
}

.wrapper{
  max-width:400px;
  margin:auto;
}

.phone{
  background:#000;
  padding:10px;
  border-radius:30px;
}

.screen{
  background:white;
  padding:20px;
  border-radius:20px;
}

.btn{
  display:block;
  margin:10px 0;
  padding:10px;
  background:#333;
  color:white;
  text-decoration:none;
  border-radius:10px;
}
""",

    "u/index.html": """<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Landing</title>
<link rel="stylesheet" href="../style.css">
</head>
<body>

<div id="app">Cargando...</div>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>
<script src="../config.js"></script>
<script src="../app.js"></script>

</body>
</html>
"""
}

# Crear estructura
for path, content in files.items():
    full_path = os.path.join(BASE, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)

    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("✅ Proyecto creado en carpeta 'landing-saas'")
