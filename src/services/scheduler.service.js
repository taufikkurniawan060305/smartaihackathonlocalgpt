const cron = require("node-cron");
const { PrismaClient } = require("../generated/prisma");
const { sendEmail } = require("./email.service");
const { postTweet } = require("./twitter.service");
const prisma = new PrismaClient();


const runActivityScheduler = () => {
  // Run every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    console.log("⏳ Checking scheduled marketing captions...");

    try {
      const now = new Date();

      // 1️⃣ Cari semua marketing yang pending dan scheduled_at <= sekarang
      const pendingMarketing = await prisma.marketing.findMany({
        where: {
          status: "pending",
          scheduled_at: { lte: now },
          platform: { in: ["email", "twitter"] }
        }
      });

      if (pendingMarketing.length === 0) {
        console.log("✅ No scheduled marketing to execute.");
        return;
      }

      // 2️⃣ Eksekusi tiap record
      for (const record of pendingMarketing) {

        // Jika platform email, kirim ke semua emails yang tersimpan
        if (record.platform === "email" && Array.isArray(record.emails) && record.emails.length > 0) {
          for (const email of record.emails) {
            try {
              await sendEmail({
                to: email,
                subject: `Check this out: ${record.subject}`,
                text: record.content,
                html: `<p>${record.content}</p>`
              });
              console.log(`📧 Email sent to ${email} for marketing ${record.id}`);
            } catch (err) {
              console.error(`❌ Error sending email to ${email}:`, err);
            }
          }
        }

      if (record.platform === "twitter") {
        try {
          // // Post the tweet and get its ID
          // const tweetId = await postTweet(record.content);

          // await prisma.tweets.create({
          //   data: {
          //     userId: record.userId,    
          //     tweetId: tweetId,  
          //     retweet_count: 0,
          //     reply_count: 0,
          //     like_count: 0,
          //     quote_count: 0,
          //     bookmark_count: 0,
          //     impression_count: 0
          //   }
          // });

          console.log(`Tweet posted and saved successfully. Tweet ID: ${tweetId}`);
        } catch (err) {
          console.error("Error posting tweet or saving to DB:", err);
        }
      }

        // 3️⃣ Update status menjadi active
        await prisma.marketing.update({
          where: { id: record.id },
          data: { status: "active" }
        });
      }

      console.log(`✅ Executed ${pendingMarketing.length} scheduled marketing captions.`);
    } catch (err) {
      console.error("❌ Scheduler error:", err);
    }
  });
};

module.exports = { runActivityScheduler };
