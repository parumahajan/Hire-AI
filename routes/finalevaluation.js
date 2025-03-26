// require("dotenv").config();
// const express = require("express");
// const axios = require("axios");

// const router = express.Router();

// const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
// if (!GOOGLE_API_KEY) {
//     console.error("❌ Error: GOOGLE_API_KEY is missing in environment variables.");
//     process.exit(1);
// }

// const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`;

// // **Generate the AI Prompt**
// const generatePrompt = (conversation, summary) => {
//     return `
//     You are an AI interviewer evaluating a candidate's interview performance based on their conversation. Provide a structured evaluation.

//     **Interview Transcript:**
//     ${JSON.stringify(conversation, null, 2)}

//     **Candidate Summary:** 
//     ${summary}

//     **Evaluation Criteria:**
//     - "strengths": List key strengths based on the conversation.
//     - "areasForImprovement": Highlight areas that need improvement.
//     - "detailedFeedback": Provide ratings and insights on:
//       - "Technical Skills"
//       - "Communication Skills"
//       - "Problem-Solving Ability"
//       - "Team Collaboration"
//     - "finalDecision":
//       - "decision": "Accepted" or "Rejected"
//       - "ratings": Rate each category (1-5).
//       - "confidenceScore": How confident you are in this decision.
//     - "additionalInsights":
//       - "sentimentAnalysis": Emotional tone of the conversation.
//       - "recommendedResources": Learning materials based on weak areas.
//       - "alternateRoleSuggestions": Other potential roles for the candidate.

//     **Return JSON only (no extra text, no markdown formatting):**
//     \`\`\`json
//     {
//         "strengths": ["Technical Related",],
//         "areasForImprovement": ["Realated to Technical Improvements"],
//         "detailedFeedback": {
//             "Technical Skills": "Strong in algorithms, weak in databases",
//             "Communication Skills": "Clear but hesitant",
//             "Problem-Solving Ability": "Logical but slow",
//             "Team Collaboration": "Not enough data"
//         },
//         "finalDecision": {
//             "decision": "Accepted/Rejected",
//             "ratings": {
//                 "Technical Skills": 4,
//                 "Communication Skills": 3,
//                 "Problem-Solving": 4,
//                 "Experience Level": 3
//             },
//             "confidenceScore": "High"
//         },
//         "additionalInsights": {
//             "sentimentAnalysis": {
//                 "overallSentiment": "Positive",
//                 "emotionalTone": "Confident"
//             },
//             "recommendedResources": [
//                 {
//                     "topic": "Database Optimization",
//                     "resource": "https://www.some-resource.com"
//                 }
//             ],
//             "alternateRoleSuggestions": ["Data Analyst", "Backend Engineer"]
//         }
//     }
//     \`\`\`
//     `;
// };

// // **POST Route to Evaluate the Interview**
// router.post("/", async (req, res) => {
//     try {
//         const { conversation, summary } = req.body;

//         // Validate input
//         if (!conversation || !summary || !Array.isArray(conversation) || typeof summary !== "string") {
//             return res.status(400).json({ message: "Invalid input. 'conversation' must be an array and 'summary' must be a string." });
//         }

//         const prompt = generatePrompt(conversation, summary);

//         // **Send API Request**
//         const response = await axios.post(
//             GEMINI_API_URL,
//             { contents: [{ parts: [{ text: prompt }] }] },
//             { headers: { "Content-Type": "application/json" } }
//         );

//         console.log("🔹 Raw API Response:", JSON.stringify(response.data, null, 2));

//         let rawContent = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

//         // **Sanitize AI Response**
//         rawContent = rawContent
//             .replace(/```json/g, "") // Remove Markdown JSON block
//             .replace(/```/g, "") // Remove closing Markdown
//             .trim();

//         console.log("📝 Sanitized JSON String:", rawContent);

//         let evaluation;
//         try {
//             evaluation = JSON.parse(rawContent); // Parse JSON
//         } catch (jsonError) {
//             console.error("❌ JSON Parsing Error:", jsonError);
//             return res.status(500).json({
//                 message: "Invalid JSON response from AI",
//                 rawContent
//             });
//         }

//         return res.json({ conversation, summary, evaluation });

//     } catch (error) {
//         console.error("❌ API Error:", error);
//         return res.status(500).json({
//             message: "Failed to process evaluation",
//             error: error.message
//         });
//     }
// });

// module.exports = router;

require("dotenv").config();
const express = require("express");
const axios = require("axios");
const twilio = require("twilio");

const router = express.Router();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

if (!GOOGLE_API_KEY) {
    console.error("❌ Error: GOOGLE_API_KEY is missing in environment variables.");
    process.exit(1);
}

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`;

// Twilio Configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;
const CONTENT_SID = "HXb5b62575e6e4ff6129ad7c8efe1f983"; // Predefined content template SID

// **Generate the AI Prompt**
const generatePrompt = (conversation, summary) => {
    return `
    You are an AI interviewer evaluating a candidate's interview performance based on their conversation. Provide a structured evaluation.

    **Interview Transcript:**
    ${JSON.stringify(conversation, null, 2)}

    **Candidate Summary:** 
    ${summary}

    **Evaluation Criteria:**
    - "strengths": List key strengths based on the conversation.
    - "areasForImprovement": Highlight areas that need improvement.
    - "detailedFeedback": Provide ratings and insights on:
      - "Technical Skills"
      - "Communication Skills"
      - "Problem-Solving Ability"
      - "Team Collaboration"
    - "finalDecision":
      - "decision": "Accepted" or "Rejected"
      - "ratings": Rate each category (1-5).
      - "confidenceScore": How confident you are in this decision.

    **Return JSON only (no extra text, no markdown formatting):**
    \`\`\`json
    {
        "strengths": ["Technical Related"],
        "areasForImprovement": ["Related to Technical Improvements"],
        "detailedFeedback": {
            "Technical Skills": "Strong in algorithms, weak in databases",
            "Communication Skills": "Clear but hesitant",
            "Problem-Solving Ability": "Logical but slow",
            "Team Collaboration": "Not enough data"
        },
        "finalDecision": {
            "decision": "Accepted/Rejected",
            "ratings": {
                "Technical Skills": 4,
                "Communication Skills": 3,
                "Problem-Solving": 4,
                "Experience Level": 3
            },
            "confidenceScore": "High"
        }
    }
    \`\`\`
    `;
};

// **Function to Send WhatsApp Notification**
const sendWhatsAppNotification = async (phone_no, candidate_name, decision) => {
    try {
        let statusMessage;
        if (decision === "Accepted") {
            statusMessage = `Congratulations! You have cleared this round. Our team will contact you soon.`;
        } else {
            statusMessage = `Unfortunately, you were not selected for the next round. We encourage you to apply again in the future!`;
        }

        const contentVariables = JSON.stringify({ "1": candidate_name, "2": statusMessage });

        const message = await client.messages.create({
            from: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
            to: `whatsapp:${phone_no}`,
            contentSid: CONTENT_SID,
            contentVariables: contentVariables
        });

        console.log("✅ WhatsApp Notification Sent:", message.sid);
        return { success: true, message: "WhatsApp notification sent successfully!", sid: message.sid };
    } catch (error) {
        console.error("❌ Error Sending WhatsApp Message:", error);
        return { success: false, message: "Failed to send WhatsApp notification.", error: error.message };
    }
};

// **POST Route to Evaluate the Interview**
router.post("/", async (req, res) => {
    try {
        const { conversation, summary, phone_no, candidate_name } = req.body;

        if (!conversation || !summary || !phone_no || !candidate_name) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const prompt = generatePrompt(conversation, summary);

        // **Send API Request**
        const response = await axios.post(
            GEMINI_API_URL,
            { contents: [{ parts: [{ text: prompt }] }] },
            { headers: { "Content-Type": "application/json" } }
        );

        console.log("🔹 Raw API Response:", JSON.stringify(response.data, null, 2));

        let rawContent = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

        // **Sanitize AI Response**
        rawContent = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();

        console.log("📝 Sanitized JSON String:", rawContent);

        let evaluation;
        try {
            evaluation = JSON.parse(rawContent); // Parse JSON
        } catch (jsonError) {
            console.error("❌ JSON Parsing Error:", jsonError);
            return res.status(500).json({
                message: "Invalid JSON response from AI",
                rawContent
            });
        }

        const { decision } = evaluation.finalDecision;

        // 🔹 Send WhatsApp Notification
        const whatsappResponse = await sendWhatsAppNotification(phone_no, candidate_name, decision);

        return res.json({ conversation, summary, evaluation, whatsappResponse });

    } catch (error) {
        console.error("❌ API Error:", error);
        return res.status(500).json({
            message: "Failed to process evaluation",
            error: error.message
        });
    }
});

module.exports = router;
