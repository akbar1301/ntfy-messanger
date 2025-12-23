export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  try {
    const formData = new FormData();
    formData.append("reqtype", "fileupload");
    formData.append("fileToUpload", req);

    const r = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: formData,
    });

    const url = (await r.text()).trim();

    res.status(200).json({ url });
  } catch (e) {
    res.status(500).json({ error: "upload failed" });
  }
}
