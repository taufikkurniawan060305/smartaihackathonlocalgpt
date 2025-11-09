const { detectIntent } = require("../services/intents.service");
const { buildResponse } = require("./responseBuilder"); // your cheerful response builder
const { parseIntentOutput } = require("../functions/utils.function");
const { sendEmail } = require("../services/email.service");
const { askGroq } = require("../services/groq.service");

exports.circloHookHandler = async (req, res) => {
  try {
    const { user, message, history = [] } = req.body;

    // 1️⃣ Detect AI intent
    const aiText = await detectIntent({ message, history });

    // 2️⃣ Parse structured output
    const { topic, time, isCalendar, isMeeting, isUserAskOnlineTravelRelated, isUserSearchPeopleOnlineRelated,     nameOfOnlinePlaceToBeTraveled,
    nameOfUserAskedToBeSearch, emails  } = parseIntentOutput(aiText);

    // 3️⃣ Build response based on topic and service
    const { reply, result } = await buildResponse({
      topic,
      user,
      message,
      time,
      isCalendar,
      isMeeting,
      isUserAskOnlineTravelRelated,
      isUserSearchPeopleOnlineRelated,
          nameOfOnlinePlaceToBeTraveled,
    nameOfUserAskedToBeSearch,
    emails,
    });

      if (Array.isArray(emails) && emails.length > 0 &&  topic == 'activity') {
        (async () => {
          try {
            // 1️⃣ Buat system prompt untuk Groq agar membuat body email
            const systemPrompt = `
      You are an AI assistant tasked to generate an email body for a beneficiary. 
      You have the following context:

      - Topic: "${topic}"
      - Appointment info:
        - Date: ${time.normalizedDate} 
      - Google Calendar Link: ${result.meetInfo?.htmlLink}
      - Google Meet Link: ${result.meetInfo?.meetLink}

      Generate a professional, friendly, and clear email text and HTML that includes:
      - A greeting
      - Explanation of the appointment
      - Links to Google Calendar and Google Meet
      - Closing and signature
          - there is no beneficiary name, there is no sender name
          - make it clean
      Return the result in  HTML format.
      `;

            // 2️⃣ Ask Groq untuk generate email body
            const emailBody = await askGroq({
              message: "",
              systemPrompt,
              options: { temperature: 0.7, max_completion_tokens: 3500 }
            });

            console.log("masuk email")
            // 3️⃣ Kirim email ke semua beneficiary
            emails.forEach(email => {
              sendEmail({
                to: email,
                subject: `Informasi Appointment: ${topic}`,
                text: emailBody,
                html: emailBody
              }).catch(err => console.error(`Error sending email to ${email}:`, err));
            });

          } catch (err) {
            console.error("Error generating/sending email in background:", err);
          }
        })();
      }


    // 4️⃣ Return structured payload including friendly message
    res.json({
      topic,
      time,
      raw: aiText,
      message : reply,      // ✅ human-friendly message
      from: "groq",
      serviceResult: result // optional, contains Activity/Marketing output
    });

  } catch (error) {
    console.error("Groq error:", error);
    res.status(500).json({
      error: "Groq failed",
      details: error?.message
    });
  }
};

