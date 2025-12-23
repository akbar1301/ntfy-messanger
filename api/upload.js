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

  try {
    const form = formidable({ multiples: false });

    const [fields, files] = await form.parse(req);

    const file = files.file?.[0];

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // read file as buffer
    const buffer = fs.readFileSync(file.filepath);

    // convert to base64 (ImgBB REQUIREMENT)
    const base64Image = buffer.toString("base64");

    // build ImgBB request
    const imgForm = new FormData();
    imgForm.append("image", base64Image);

    const imgbbRes = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      {
        method: "POST",
        body: imgForm,
        headers: imgForm.getHeaders() // 🔴 KRUSIAL
      }
    );

    const result = await imgbbRes.json();

    if (!result.success) {
      return res.status(500).json({
        error: "ImgBB upload failed",
        result
      });
    }

    return res.status(200).json({
      url: result.data.url
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Exception",
      message: err.message
    });
  }
}
