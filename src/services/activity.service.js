const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const { createCalendarEvent } = require("../lib/googleMeetClient")
const { DateTime } = require("luxon"); // npm install luxon

exports.Activity = async ({ isCalendar, isMeeting, user, message, time }) => {
  console.log("=== Activity Service ===");
  console.log("User message:", message);
  console.log("Time object:", time);

  let scheduleDate = null;

  try {
    // 1️⃣ Build scheduleDate safely
    if (time?.hasDate || time?.hasHour) {
      const datePart = time?.normalizedDate || DateTime.now().setZone("Asia/Jakarta").toISODate();
      let hour = 12; // default hour if missing
      if (time?.hasHour && !isNaN(parseInt(time.normalizedHour, 10))) {
        hour = parseInt(time.normalizedHour, 10);
      }

      // Use luxon to create a Date object in Jakarta timezone
      scheduleDate = DateTime.fromISO(`${datePart}T${hour.toString().padStart(2, "0")}:00:00`, { zone: "Asia/Jakarta" }).toJSDate();

      if (isNaN(scheduleDate.getTime())) {
        console.warn("⚠ Invalid scheduleDate, setting to null");
        scheduleDate = null;
      }
    }

    console.log("Computed scheduleDate:", scheduleDate);

    // 2️⃣ Save activity in Prisma

    let type = ""
    if (isMeeting || isCalendar) {
      type = "appointment"
    }
    const newActivity = await prisma.activity.create({
      data: {
        userId: user,
        isScheduled: Boolean(scheduleDate),
        date: scheduleDate,
        rawDate: `${time?.rawDate || ""} ${time?.rawHour || ""}`.trim(),
        content : message,
        type : type
      },
    });

    console.log("✅ Activity saved:", newActivity);

    // 3️⃣ Create Google Calendar / Meet event if requested
    let meetInfo = null;
    if (isCalendar && scheduleDate) {
      try {
        const endDate = new Date(scheduleDate.getTime() + 60 * 60 * 1000); // 1 hour duration
        meetInfo = await createCalendarEvent({
          summary: `Activity: ${message}`,
          description: `Created from user activity ID: ${newActivity.id}`,
          startDate: scheduleDate,
          endDate,
          isMeeting,
        });

        console.log("📅 Event created:", meetInfo?.htmlLink);
        console.log("🔗 Google Meet link:", meetInfo?.meetLink);
      } catch (err) {
        console.error("❌ Failed to create Google Calendar event:", err);
      }
    }

    
    return { success: true, activity: newActivity, meetInfo };
  } catch (err) {
    console.error("❌ Activity function error:", err);
    return { success: false, error: err.message };
  }
};