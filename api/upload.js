import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err || !files.file) {
      return res.status(400).json({ error: "No file received" });
    }

    const file = files.file[0];
    const buffer = fs.readFileSync(file.filepath);

    const catForm = new FormData();
    catForm.append("reqtype", "fileupload");
    catForm.append(
      "fileToUpload",
      new Blob([buffer], { type: file.mimetype }),
      file.originalFilename
    );

    const r = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: catForm,
    });

    let url = (await r.text()).trim();
    if (url.startsWith("http://")) {
      url = url.replace("http://", "https://");
    }

    res.status(200).json({ url });
  });
}
