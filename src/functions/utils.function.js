function parseIntentOutput(text) {
  // Extract simple boolean flags
  const isCalendar = text.match(/isCalendar:\s*(true|false)/)?.[1] === "true";
  const isMeeting = text.match(/isMeeting:\s*(true|false)/)?.[1] === "true";

  // Extract free answer
  const answer = text.match(/answer:\s*(.+)/)?.[1]?.trim() || null;

  // Extract topic (support multi-word topic)
  const topic = text.match(/topic:\s*(.+)/)?.[1]?.trim() || null;

  // Extract time object
  const timeBlock = text.match(/time:\s*\{([\s\S]*?)\}/)?.[1];
  let time = {
    rawDate: "",
    rawHour: "",
    normalizedDate: "",
    normalizedHour: "",
    hasDate: false,
    hasHour: false
  };

  if (timeBlock) {
    const entries = timeBlock
      .trim()
      .split("\n")
      .map(line => line.trim().replace(/,$/, ""));
    
    for (const entry of entries) {
      const [key, value] = entry.split(":").map(x => x.trim());
      if (!key) continue;

      // Remove quotes if present
      time[key] = value?.replace(/^"|"$/g, "") || "";
    }

    // Convert boolean strings to actual booleans
    if (time.hasDate !== undefined) time.hasDate = time.hasDate === "true";
    if (time.hasHour !== undefined) time.hasHour = time.hasHour === "true";
  }

  // Extract online travel / user search flags
  const isUserAskOnlineTravelRelated = text.match(/isUserAskOnlineTravelRelated:\s*(true|false)/)?.[1] === "true";
  const isUserSearchPeopleOnlineRelated = text.match(/isUserSearchPeopleOnlineRelated:\s*(true|false)/)?.[1] === "true";

  // Extract string fields for online place / user to search
  const nameOfOnlinePlaceToBeTraveled = text.match(/nameOfOnlinePlaceToBeTraveled:\s*(.+)/)?.[1]?.trim() || "";
  const nameOfUserAskedToBeSearch = text.match(/nameOfUserAskedToBeSearch:\s*(.+)/)?.[1]?.trim() || "";

  // Extract emails array if present
  const emailsMatch = text.match(/emails:\s*\[([^\]]*)\]/);
  const emails = emailsMatch
    ? emailsMatch[1]
        .split(",")
        .map(e => e.trim().replace(/^"|"$/g, ""))
        .filter(Boolean)
    : [];

  return {
    isCalendar,
    isMeeting,
    answer,
    topic,
    time,
    isUserAskOnlineTravelRelated,
    isUserSearchPeopleOnlineRelated,
    nameOfOnlinePlaceToBeTraveled,
    nameOfUserAskedToBeSearch,
    emails
  };
}

module.exports = { parseIntentOutput };
