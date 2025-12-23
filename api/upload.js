import formidable from "formidable";
import fs from "fs";
import FormData from "form-data";
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: "Form parse error" });
    }

    const file = files.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      // read file → base64
      const buffer = fs.readFileSync(file.filepath);
      const base64 = buffer.toString("base64");

      // build multipart/form-data (PENTING)
      const fd = new FormData();
      fd.append("image", base64);

      // upload to imgbb (SAMA PERSIS SEPERTI DOCS)
      const upload = await fetch(
        `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
        {
          method: "POST",
          body: fd,
          headers: fd.getHeaders()
        }
      );

      const json = await upload.json();

      if (!json.success) {
        return res.status(500).json({
          error: "Upload failed",
          detail: json
        });
      }

      return res.status(200).json({
        url: json.data.url
      });

    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });
}
