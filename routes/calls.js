// const express = require("express");

// const router = express.Router();

// router.get("/", async (req, res) => {
//     try {
//         const response = await globalThis.fetch("https://api.bland.ai/v1/calls", {
//             method: "GET",
//             headers: {
//                 authorization: "org_2ebdbdd009f7fc24ac09babec0ef9cf48ab154f03429be17338c3f7a33b9dbb9a66009ea78cf641e2ea369", // Replace with actual API key
//             },
//         });

//         if (!response.ok) {
//             throw new Error(`API request failed with status ${response.status}`);
//         }

//         const data = await response.json();
//         console.log("✅ API Response:", data);
//         res.json(data); // Send response to client
//     } catch (err) {
//         console.error("❌ API Error:", err);
//         res.status(500).json({ error: "Internal Server Error", details: err.message });
//     }
// });

// module.exports = router;

const express = require("express");
const fs = require("fs");
const axios = require("axios");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        // Fetch calls from the API
        const response = await fetch("https://api.bland.ai/v1/calls", {
            method: "GET",
            headers: {
                authorization: "org_2ebdbdd009f7fc24ac09babec0ef9cf48ab154f03429be17338c3f7a33b9dbb9a66009ea78cf641e2ea369", // Replace with actual API key
            },
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ API Response:", data);

        // Extract recording URL from the first call (change logic if needed)
        const call = data.calls[0]; // Get first call (modify as needed)
        if (!call || !call.recording_url) {
            throw new Error("❌ No recording URL found in API response.");
        }

        const recordingUrl = call.recording_url;
        console.log("🎤 Recording URL:", recordingUrl);

        // Download the recording
        const filePath = `recordings/${call.call_id}.mp3`; // Save in "recordings" folder

        const writer = fs.createWriteStream(filePath);
        const recordingResponse = await axios({
            url: recordingUrl,
            method: "GET",
            responseType: "stream",
        });

        recordingResponse.data.pipe(writer);

        writer.on("finish", () => {
            console.log("✅ Download complete:", filePath);
            res.json({ message: "Download complete", filePath });
        });

        writer.on("error", (err) => {
            console.error("❌ Error saving recording:", err);
            res.status(500).json({ error: "Failed to save recording" });
        });

    } catch (err) {
        console.error("❌ Error:", err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

module.exports = router;
