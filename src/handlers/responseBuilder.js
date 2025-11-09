const { Activity } = require("../services/activity.service");
const { Marketing } = require("../services/marketting.service");
const { askGroq } = require("../services/groq.service"); // your Groq wrapper
const { callReadStringAPI } = require("../functions/api.function"); // your Groq wrapper
const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const { getJson } = require("serpapi");

/**
 * Build user-friendly response using Groq
 * @param {Object} params
 * @param {string} params.topic
 * @param {Object} params.user
 * @param {string} params.message
 * @param {Object} params.time
 * @param {boolean} params.isCalendar
 * @param {boolean} params.isMeeting
 */
async function buildResponse({ topic, user, message, time, isCalendar, isMeeting, isUserAskOnlineTravelRelated,
      isUserSearchPeopleOnlineRelated,     nameOfOnlinePlaceToBeTraveled,
    nameOfUserAskedToBeSearch, emails
    }) {

      console.log(nameOfOnlinePlaceToBeTraveled
        , nameOfUserAskedToBeSearch
      )
    let resultSearchUser = [];

    let resultSearchTravel = [];
    let result 
  let isScheduleInADay = []; // jangan undefined

    if (topic == "activity"){
    if (isUserSearchPeopleOnlineRelated && !nameOfUserAskedToBeSearch) {
        const searchResults = await handleSearchAppointment("siapa", nameOfUserAskedToBeSearch);  
        resultSearchUser = mapToLinkDTO(searchResults);
    }


    if (isUserAskOnlineTravelRelated || nameOfOnlinePlaceToBeTraveled) {
        const searchResults = await handleSearchAppointment("ticket flight/bus to", nameOfOnlinePlaceToBeTraveled);  
        resultSearchTravel = mapToLinkDTO(searchResults);
    }

      if (isMeeting || isUserAskOnlineTravelRelated) {
        const dayStart = new Date();
        dayStart.setUTCDate(dayStart.getUTCDate() + 1); // besok UTC
        dayStart.setUTCHours(0, 0, 0, 0);

        const dayEnd = new Date(dayStart);
        dayEnd.setUTCHours(23, 59, 59, 999);

        console.log("Day range:", dayStart.toISOString(), dayEnd.toISOString());

        isScheduleInADay = await prisma.activity.findMany({
          where: {
            userId: user.id,
            isScheduled: true,
            isDone: false,
            type: 'appointment',
            date: {
              gte: dayStart,
              lte: dayEnd
            }
          }
        });

    }
    }




  // 1️⃣ Perform backend action depending on topic
  switch (topic) {


    case "activity":

      result = await Activity({
        isCalendar,
        isMeeting,
        user: user.id,
        message,
        time,
      });
      break;

    case "marketing":
      result = await Marketing({
        user: user.id,
        message,
        time,
        topic : message,
        emails,
      });
      break;

    case "content-generation":
      // result = await ContentGeneration({...});
      break;

    default:
      result = null;
      break;
  }

  let systemPrompt

        // 2️⃣ Generate human-friendly response via Groq

        if (topic == "activity") {

              let appointmentsSummary = "";

                  if (isScheduleInADay.length > 0) {
                    appointmentsSummary = isScheduleInADay
                      .map((item) => `• ${item.content} pada ${item.date.toLocaleString()} ⏰`)
                      .join("\n");
                  }

                  
                  const userLinksSection = (resultSearchUser && resultSearchUser.length > 0)
                ? `LINK PROFIL ORANG (top ${Math.min(3, resultSearchUser.length)}):\n` +
                  resultSearchUser.slice(0, 1)
                    .map((r, i) => `• ${r.title}: ${r.link}`)
                    .join("\n") + "\n\n"
                : "";



              const travelLinksSection = (resultSearchTravel && resultSearchTravel.length > 0)
                ? `LINK TIKET / FLIGHT (top ${Math.min(3, resultSearchTravel.length)}):\n` +
                  resultSearchTravel.slice(0, 3)
                    .map((r, i) => `• ${r.title}: ${r.link}`)
                    .join("\n") + "\n\n"
                : "";


              // Buat bagian reminder hanya jika ada
              const reminderSection = appointmentsSummary
                ? `REMINDER APPOINTMENT (use this to remind the user of their upcoming scheduled activity):\n${appointmentsSummary}\n\n`
                : "";

              systemPrompt = `
              You are a cheerful, friendly, and helpful assistant.
              Based on the following information, craft a reply to the user in a human tone with emojis if appropriate.
              Be concise, warm, and clear.

              ${reminderSection}${userLinksSection}${travelLinksSection}USER MESSAGE:
              ${message}

              TOPIC:
              ${topic}
              ${time ? `TIME INFO:\n${JSON.stringify(time)}` : ""}
              ${result?.meetInfo ? `CALENDAR EVENT INFO:\n${JSON.stringify(result.meetInfo)}` : ""}

              Instruction:
              - If there are any upcoming appointments in the reminder section, **mention them politely** in your reply.
              - Include any Google Meet or calendar link if available.
              - Always respond in a friendly, human-like tone, and use emojis where appropriate.
              - Keep it concise but warm.
              `;

              console.log(systemPrompt);

        } 

        if (topic == "marketing") {
                        systemPrompt = ` ${message} `

        }

const reply = await askGroq({
  message: "", // message can be empty because systemPrompt has full context
  systemPrompt : systemPrompt,
  options: { temperature: 0.7, max_completion_tokens: 3500 }
});


      return { reply, result };
    }



async function handleSearchUser(userInput) {


    // Ambil nama orang dari userInput
    const nameToSearch = userInput; // misal langsung string nama orang

    // Panggil SerpAPI function
    const results = await searchGoogle(nameToSearch);

    // Format hasil
    const formatted = results.map((r, i) => ({
      no: i + 1,
      title: r.title,
      link: r.link,
      snippet: r.snippet
    }));

    console.log("Hasil pencarian nama orang:", formatted);

    // Bisa juga kirim ke user lewat chat / API response
    return formatted;
  
}

async function handleSearchAppointment(query) {
    const results = await searchGoogle(query);

    const formatted = results.slice(0, 5).map((r, i) => ({
      no: i + 1,
      title: r.title,
      link: r.link,
      snippet: r.snippet
    }));

    console.log("Hasil pencarian:", formatted);
    return formatted;
}

function mapToLinkDTO(results) {
  return results.map(r => ({
    title: r.title,
    link: r.link
  }));
}

async function searchGoogle(query) {
  try {
    const response = await getJson({
      engine: "google",
      api_key: "8f6eeeeb798f63dfcfb19a45746e555172e493d146bd8dcaa249de703f2d8efa", // simpan API key di environment variable
      q: query,
      location: "Indonesia",
      hl: "id",
      gl: "id"
    });

    return response.organic_results || [];
  } catch (err) {
    console.error("SerpAPI Error:", err.message);
    return [];
  }
}


module.exports = { buildResponse };


