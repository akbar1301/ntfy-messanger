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

  try {
    const [fields, files] = await form.parse(req);

    if (!files.file || !files.file[0]) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = files.file[0];
    const buffer = fs.readFileSync(file.filepath);

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

    res.json({ url: result.data.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Exception",
      message: err.message,
    });
  }
}
