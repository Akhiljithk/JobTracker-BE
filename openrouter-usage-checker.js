import "dotenv/config";

const getUsage = async () => {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/auth/key", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log("--- Key Info ---");
      console.log(`Label: ${data.data.label}`);
      console.log(`Usage: $${data.data.usage}`);
      console.log(`Limit: ${data.data.limit || "No limit"}`);
      console.log(`Is Free Tier: ${data.data.is_free_tier}`);
    } else {
      console.error("Error fetching key info:", data);
    }
  } catch (err) {
    console.error("Connection failed:", err);
  }
};

getUsage();