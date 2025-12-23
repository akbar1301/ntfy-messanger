import formidable from "formidable";
import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({
    multiples: false,
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    try {
      if (err) {
        return res.status(400).json({ error: "Form parse error" });
      }

      if (!files.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const file = Array.isArray(files.file)
        ? files.file[0]
        : files.file;

      const buffer = fs.readFileSync(file.filepath);

      if (!process.env.IMGBB_API_KEY) {
        return res.status(500).json({
          error: "Missing IMGBB_API_KEY",
        });
      }

      const imgForm = new FormData();
      imgForm.append("image", buffer.toString("base64"));

      const upload = await fetch(
        `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
        {
          method: "POST",
          body: imgForm,
        }
      );

      const result = await upload.json();

      if (!result.success) {
        return res.status(500).json({
          error: "ImgBB upload failed",
          result,
        });
      }

      return res.json({
        url: result.data.url,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        error: "Exception",
        message: e.message,
      });
    }
  });
}
