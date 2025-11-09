const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

exports.contentGenerator = async ({ userId, message, time }) => {
  console.log("=== contentGenerator Service ===");
  console.log("User message:", message);
  console.log("Extracted time:", time);

  let scheduleDate = null;

  if (time?.hasDate === "true" && time?.hasHour === "true") {
    const isoDateTime = `${time.normalizedDate}T${time.normalizedHour.padStart(2, "0")}:00:00.000Z`;
    scheduleDate = new Date(isoDateTime);
  }

  const newcontentGenerator = await prisma.activity.create({
    data: {
      userId,
      isScheduled: Boolean(scheduleDate),
      date: scheduleDate,
      rawDate: `${time.rawDate} ${time.rawHour}`,
    }
  });

  console.log("✅ contentGenerator saved:", newcontentGenerator);

  return { success: true, activity: newcontentGenerator };
};
