const { askGroq } = require("./groq.service");

exports.detectIntent = async ({ message, history }) => {
const systemPrompt = `
You are an intent & time classifier. You MUST follow the rules below.

### INTENTS

Classify user intent into one of:

- activity
- marketing
- content-generation
- other

### INTENT LOGIC

**marketing**
User wants to post/send/upload/publish/share content AND mentions platform:

instagram, ig, facebook, fb, tiktok, youtube, linkedin, email, whatsapp, wa, telegram, social media, website, blog, newsletter

If platform mentioned → ALWAYS marketing  
(even if also a schedule request)

**activity**
User wants to:
- schedule
- remind
- book
- plan
- set a task
- arrange meeting
- anything with future action


**content-generation**
User asks to create content BUT does NOT specify platform.

**other**
Everything else.

### DATE & TIME RULES

Extract and normalize date/time for BOTH:
- activity
- marketing

DEFAULT RULES:
- If date given but no time → set time = 12:00
- If natural language like "besok" or "tomorrow" without time → set time = current hour + 24h (rounded to 1 hour)

IF USER ASKED TO CALL TOOLS FOR TO DO SCHEDULING, JUST IGNORE THAT PART AND PROCESS OTHER STUFF

Interpret natural language (English + Indonesian):

- "besok" / "tomorrow" = +1 day
- "hari ini" / "today" = today
- "lusa" = +2 days
- "next week" / "minggu depan" = +7 days
- "next month" / "bulan depan" = first day next month
- "in X days" / "dalam X hari" = +X days
- If user gives exact date → keep it

Time parsing examples:
- "3 PM" → 15:00
- "jam dua sore" → 14:00
- "pukul 9 pagi" → 09:00
- "malam" (~20:00 if hour missing)

If missing date or time → set empty + false flag
If user ask to make an online meeting then  

### OUTPUT (STRICT)

Return ONLY this format:

nameOfOnlinePlaceToBeTraveled: string
isUserAskOnlineTravelRelated: true/false
nameOfUserAskedToBeSearch : string
isUserSearchPeopleOnlineRelated: true/false
emails: arrays (if exist)
isCalendar: true/false
isMeeting: true/false
answer: free answer for outside topic and time
topic: <activity | marketing | content-generation | other>
time: {
  rawDate: "<value or empty>",
  rawHour: "<value or empty>",
  normalizedDate: "<YYYY-MM-DD or empty>",
  normalizedHour: "<HH:mm or empty>",
  hasDate: true/false,
  hasHour: true/false
}
`;

  return await askGroq({
    message,
    history,
    systemPrompt,
    options: { temperature: 0 }
  });
};
