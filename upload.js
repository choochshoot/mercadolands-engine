// ==========================
// CONFIG
// ==========================
const BUCKET = "landing-assets";

// ==========================
// INPUTS
// ==========================
const imageInput =
  document.getElementById("profile-upload");

const slugInput =
  document.getElementById("slug");

const uploadBtn =
  document.getElementById("upload-btn");

const preview =
  document.getElementById("preview");

const statusBox =
  document.getElementById("upload-status");

// ==========================
// STATUS
// ==========================
function setStatus(
  msg,
  color = "#333"
) {

  statusBox.innerHTML = msg;

  statusBox.style.color = color;
}

// ==========================
// VALIDATE FILE
// ==========================
function validateFile(file) {

  const allowed = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/heic"
  ];

  if (!allowed.includes(file.type)) {

    throw new Error(
      "Formato no permitido"
    );
  }

  const maxMB = 5;

  if (
    file.size >
    maxMB * 1024 * 1024
  ) {

    throw new Error(
      "La imagen supera 5MB"
    );
  }
}

// ==========================
// FILE PATH
// ==========================
function createFilePath(
  slug,
  file
) {

  const ext =
    file.name
      .split(".")
      .pop();

  const timestamp =
    Date.now();

  return `
    ${slug}/
    profile-${timestamp}.${ext}
  `
  .replace(/\s/g, "");
}

// ==========================
// UPLOAD
// ==========================
async function uploadProfilePhoto() {

  try {

    setStatus(
      "Subiendo imagen...",
      "#666"
    );

    const file =
      imageInput.files[0];

    if (!file) {

      throw new Error(
        "Selecciona una imagen"
      );
    }

    const slug =
      slugInput.value.trim();

    if (!slug) {

      throw new Error(
        "Falta slug"
      );
    }

    validateFile(file);

    // ==========================
    // CREATE PATH
    // ==========================
    const filePath =
      createFilePath(
        slug,
        file
      );

    // ==========================
    // UPLOAD TO STORAGE
    // ==========================
    const {
      error: uploadError
    } =
      await supabaseClient
        .storage
        .from(BUCKET)
        .upload(
          filePath,
          file,
          {
            cacheControl: "3600",
            upsert: true
          }
        );

    if (uploadError) {

      throw uploadError;
    }

    // ==========================
    // GET PUBLIC URL
    // ==========================
    const {
      data: publicData
    } =
      supabaseClient
        .storage
        .from(BUCKET)
        .getPublicUrl(
          filePath
        );

    const publicUrl =
      publicData.publicUrl;

    console.log(
      "PUBLIC URL:"
    );

    console.log(
      publicUrl
    );

    // ==========================
    // GET CURRENT LANDING
    // ==========================
    const {
      data: landing,
      error: landingError
    } =
      await supabaseClient
        .from("landings")
        .select("*")
        .eq("slug", slug)
        .single();

    if (landingError) {

      throw landingError;
    }

    // ==========================
    // CURRENT JSON
    // ==========================
    const currentData =
      landing.data || {};

    // ==========================
    // ENSURE PROFILE
    // ==========================
    if (
      !currentData.profile
    ) {

      currentData.profile = {};
    }

    // ==========================
    // UPDATE PHOTO
    // ==========================
    currentData.profile.photo =
      publicUrl;

    // ==========================
    // UPDATE LANDING JSON
    // ==========================
    const {
      error: updateError
    } =
      await supabaseClient
        .from("landings")
        .update({
          data: currentData
        })
        .eq("slug", slug);

    if (updateError) {

      throw updateError;
    }

    // ==========================
    // OPTIONAL:
    // SAVE ASSET HISTORY
    // ==========================
    await supabaseClient
      .from("landing_assets")
      .insert([
        {
          slug: slug,

          asset_type:
            "profile_photo",

          asset_url:
            publicUrl
        }
      ]);

    // ==========================
    // PREVIEW
    // ==========================
    preview.src =
      publicUrl;

    // ==========================
    // SUCCESS
    // ==========================
    setStatus(
      `
      ✅ Imagen actualizada automáticamente
      <br><br>

      <a href="${publicUrl}" target="_blank">
        Ver imagen
      </a>

      <br><br>

      <a href="u/index.html?slug=${slug}" target="_blank">
        Ver landing
      </a>
      `,
      "green"
    );

  } catch (err) {

    console.error(err);

    setStatus(
      err.message,
      "crimson"
    );
  }
}

// ==========================
// EVENT
// ==========================
uploadBtn.addEventListener(
  "click",
  uploadProfilePhoto
);