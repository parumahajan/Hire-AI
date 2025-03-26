const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("resume"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    try {
        const pdfText = await pdfParse(req.file.buffer);
        return res.json({ text: pdfText.text });
    } catch (error) {
        return res.status(500).json({ message: "Error processing PDF", error });
    }
});
module.exports = router;

