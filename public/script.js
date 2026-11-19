
const CONFIG = {
  redirectUrl: "https://www.google.com",
  collectTimezone: true,
  redirectDelay: 500
};

const button = document.getElementById("continue");
const consent = document.getElementById("consent");
const locationConsent =
  document.getElementById("locationConsent");
const message = document.getElementById("message");

function getLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }),
      () => resolve(null),
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 60000
      }
    );
  });
}

button.addEventListener("click", async () => {
  button.disabled = true;
  message.textContent = "Preparing your destination...";

  try {
    if (consent.checked) {
      let location = null;

      if (locationConsent.checked) {
        message.textContent =
          "Waiting for optional location permission...";

        location = await getLocation();
      }

      const report = {
        consent: true,
        location,
        timezone: CONFIG.collectTimezone
          ? Intl.DateTimeFormat()
              .resolvedOptions().timeZone
          : "Disabled"
      };

      try {
        const response = await fetch("/api/visit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(report)
        });

        if (!response.ok) {
          console.error("Notification delivery failed");
        }
      } catch (error) {
        console.error("Analytics unavailable:", error);
      }
    }

    message.textContent = "Redirecting...";

    setTimeout(() => {
      window.location.assign(CONFIG.redirectUrl);
    }, CONFIG.redirectDelay);

  } catch (error) {
    message.textContent = "Redirecting...";
    window.location.assign(CONFIG.redirectUrl);
  }
});
