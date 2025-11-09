const { DateTime } = require("luxon");
const { PrismaClient } = require("../generated/prisma");
const { sendEmail } = require("./email.service");
const { askGroq } = require("./groq.service");
const { postTweet } = require("./twitter.service");
const prisma = new PrismaClient();

exports.Marketing = async ({ user, time, message, topic, emails }) => {
  console.log("masuk marketting");

  // 1️⃣ Tentukan scheduled date jika ada
  let scheduledDate = null;
  if (time?.hasDate || time?.hasHour) {
    const datePart = time?.normalizedDate || DateTime.now().setZone("Asia/Jakarta").toISODate();
    let hour = 12; // default hour
    if (time?.hasHour && !isNaN(parseInt(time.normalizedHour, 10))) {
      hour = parseInt(time.normalizedHour, 10);
    }

    // 🔹 Buat DateTime dan tambahkan 7 jam
    scheduledDate = DateTime.fromISO(`${datePart}T${hour.toString().padStart(2, "0")}:00:00`, { zone: "Asia/Jakarta" })
      .plus({ hours: 7 })
      .toJSDate();

    if (isNaN(scheduledDate.getTime())) scheduledDate = null;
  }

  // 2️⃣ Generate email & Twitter captions + subject via AI
  const systemPrompt = `
You are a witty AI assistant tasked with creating marketing content.
Topic: "${topic}"

Generate:
- A short, funny, and catchy email caption
- A witty Twitter caption
- An email subject line

Rules:
- Professional but humorous
- No personal names or irrelevant details
- Keep it clean, clever, and attention-grabbing

Return as JSON:
{
  "emailSubject": "...",
  "emailCaption": "...",
  "twitterCaption": "..."
}
`;

  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(message)}`;

  console.log("masuk marketting1");

  const marketingResponse = await askGroq({
    message: message || "",
    systemPrompt,
    options: { temperature: 0.9, max_completion_tokens: 1000 }
  });

  console.log("masuk marketting2", marketingResponse);

  let content;
  try {
    let cleanText = marketingResponse;
    if (typeof marketingResponse === "string") {
      cleanText = marketingResponse
        .replace(/```json\s*/, '')   // remove opening ```json
        .replace(/```/, '')          // remove closing ```
        .trim();
    }
    content = typeof cleanText === "string" ? JSON.parse(cleanText) : cleanText;
  } catch (err) {
    console.error("Failed to parse marketing captions:", err);
    return { success: false, error: "Invalid AI response" };
  }

  // 3️⃣ Simpan ke DB
  const emailRecord = await prisma.marketing.create({
    data: {
      userId: user,
      name: `${topic} - email`,
      content: content.emailCaption,
      platform: "email",
      status: scheduledDate ? "pending" : "active",
      scheduled_at: scheduledDate,
      emails: Array.isArray(emails) && emails.length > 0 ? emails : [],
      attachment_id: imageUrl,
      subject: content.emailSubject
    }
  });

  const twitterRecord = await prisma.marketing.create({
    data: {
      userId: user,
      name: `${topic} - twitter`,
      content: content.twitterCaption,
      platform: "twitter",
      status: scheduledDate ? "pending" : "active",
      scheduled_at: scheduledDate
    }
  });

  // 4️⃣ Jika bukan scheduled, kirim email & tweet
  if (!scheduledDate && Array.isArray(emails) && emails.length > 0) {
    for (const email of emails) {
      try {
        await sendEmail({
          to: email,
          subject: content.emailSubject,
          text: content.emailCaption,
          html: `<p>${content.emailCaption}</p><img src="${imageUrl}" alt="${topic}" style="max-width:600px;"/>`
        });
        console.log(`Email sent to ${email}`);
      } catch (err) {
        console.error(`Error sending email to ${email}:`, err);
      }
    }
  }

  if (!scheduledDate) {
    try {
      // 1️⃣ Post the tweet and get its ID
      // const tweetId = await postTweet(`${content.twitterCaption} ${imageUrl}`);

      // // 2️⃣ Save to Prisma 'tweets' table
      // await prisma.tweets.create({
      //   data: {
      //     userId: user,      // your local user ID
      //     tweetId: tweetId,  // ID returned by Twitter API
      //     retweet_count: 0,
      //     reply_count: 0,
      //     like_count: 0,
      //     quote_count: 0,
      //     bookmark_count: 0,
      //     impression_count: 0
      //   }
      // });
      console.log("Tweet record saved to DB");
    } catch (err) {
      console.error("Error posting tweet or saving to DB:", err);
    }
  }


  return {
    success: true,
    data: { emailRecord, twitterRecord }
  };
};