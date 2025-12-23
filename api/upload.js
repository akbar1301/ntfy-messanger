import formidable from "formidable";
import fs from "fs";

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
      // read uploaded file
      const buffer = fs.readFileSync(file.filepath);
      const base64 = buffer.toString("base64");

      // upload to imgbb
      const uploadRes = await fetch(
        `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            image: base64
          })
        }
      );

      const json = await uploadRes.json();

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
