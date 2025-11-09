const express = require("express");
const router = express.Router();
const circloRoute = require("../api/circlo.route");
const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient()
// API route
router.use("/circlo-hook", circloRoute);

// Home route with query argument
router.get("/", (req, res) => {
  const hotel = req.query.hotel || "Royal Ambarrukmo Yogyakarta";

  // Example data (normally you can fetch from Traveloka API or your own database)
  const hotelData = {
    name: hotel,
    category: "Hotels",
    partnerStatus: "Preferred Partner Plus",
    ranking: "No. 6 in Kids-Friendly Hotel in Yogyakarta",
    award: "Traveloka Hotel Appreciation 2023: Exceptional Guest Experience",
    price: "Rp 1.339.781",
    reviews: {
      staff: 113,
      variety: 104,
      taste: 103,
      ambiance: 101,
    },
    nearby: [
      { name: "Plaza Ambarrukmo", distance: "209 m" },
      { name: "Jogja Expo Center", distance: "1.85 km" },
      { name: "Halte Ringroad Utara Sleman Yogyakarta", distance: "2.83 km" },
    ],
    facilities: ["AC", "Restaurant", "Swimming Pool", "24-Hour Front Desk", "Parking", "Elevator", "WiFi"],
    highlights: [
      "Great value in its class",
      "High-quality service",
      "Outstanding performance verified by Traveloka",
    ],
    location: "Depok",
  };

  res.render("index", { hotel: hotelData });
});


// Analytics endpoint
router.get("/analytics", async (req, res) => {
  try {
    // 1️⃣ Get userId from query or default
    const userId = req.query.userId || "c5a4c596-ac3b-4320-be72-0a77ce800784";

    // 2️⃣ Fetch all tweets for this user
    const tweets = await prisma.tweets.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // 3️⃣ Calculate some analytics
    const totalTweets = tweets.length;
    const totalLikes = tweets.reduce((sum, t) => sum + t.like_count, 0);
    const totalRetweets = tweets.reduce((sum, t) => sum + t.retweet_count, 0);
    const totalReplies = tweets.reduce((sum, t) => sum + t.reply_count, 0);
    const totalQuotes = tweets.reduce((sum, t) => sum + t.quote_count, 0);
    const totalBookmarks = tweets.reduce((sum, t) => sum + t.bookmark_count, 0);
    const totalImpressions = tweets.reduce((sum, t) => sum + t.impression_count, 0);

    // 4️⃣ Example: top 5 most liked tweets
    const topLikedTweets = [...tweets]
      .sort((a, b) => b.like_count - a.like_count)
      .slice(0, 5);

    // 5️⃣ Render EJS view
    res.render("analytics", {
      userId,
      totalTweets,
      totalLikes,
      totalRetweets,
      totalReplies,
      totalQuotes,
      totalBookmarks,
      totalImpressions,
      topLikedTweets,
      tweets,
    });
  } catch (err) {
    console.error("Error fetching analytics:", err);
    res.status(500).send("Internal Server Error");
  }
});


module.exports = router;
