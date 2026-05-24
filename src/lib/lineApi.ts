export async function sendMulticastToDrivers(driverIds: string[], jobDetails: any) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    console.warn('LINE_CHANNEL_ACCESS_TOKEN is not set. Push notification skipped.');
    return false;
  }

  if (!driverIds || driverIds.length === 0) {
    console.warn('No driver IDs provided for multicast.');
    return false;
  }

  const liffId = process.env.NEXT_PUBLIC_LIFF_ID || '';
  const appUrl = `https://liff.line.me/${liffId}?role=driver&action=claim&jobId=${jobDetails.id}`;

  const flexMessage = {
    type: "flex",
    altText: `⚠️ งานเข้า! ไปรับของที่ ${jobDetails.itemDetails.storagePosition}`,
    contents: {
      type: "bubble",
      size: "kilo",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "🚀 มีรายการเรียกฟอร์คลิฟต์",
            weight: "bold",
            color: "#ffffff",
            size: "md"
          }
        ],
        backgroundColor: "#06C755",
        paddingAll: "12px"
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: jobDetails.itemDetails.itemName,
            weight: "bold",
            size: "xl",
            wrap: true
          },
          {
            type: "text",
            text: `Batch: ${jobDetails.itemDetails.batchNumber}`,
            size: "xs",
            color: "#aaaaaa",
            wrap: true,
            margin: "sm"
          },
          {
            type: "separator",
            margin: "md"
          },
          {
            type: "box",
            layout: "vertical",
            margin: "md",
            spacing: "sm",
            contents: [
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "จุดรับ:",
                    size: "sm",
                    color: "#555555",
                    flex: 1
                  },
                  {
                    type: "text",
                    text: jobDetails.itemDetails.storagePosition,
                    size: "sm",
                    color: "#111111",
                    weight: "bold",
                    flex: 3,
                    wrap: true
                  }
                ]
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "จุดส่ง:",
                    size: "sm",
                    color: "#555555",
                    flex: 1
                  },
                  {
                    type: "text",
                    text: jobDetails.endPoint,
                    size: "sm",
                    color: "#111111",
                    weight: "bold",
                    flex: 3,
                    wrap: true
                  }
                ]
              }
            ]
          }
        ]
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "button",
            style: "primary",
            height: "sm",
            color: "#06C755",
            action: {
              type: "uri",
              label: "กดรับงานนี้",
              uri: appUrl
            }
          }
        ],
        paddingAll: "16px"
      }
    }
  };

  try {
    // Note: LINE multicast API allows up to 500 user IDs per request
    // If we have more than 500 drivers, we need to chunk the array.
    // Assuming less than 500 drivers for now.
    const response = await fetch('https://api.line.me/v2/bot/message/multicast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: driverIds,
        messages: [flexMessage],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to send multicast message:', errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending multicast:', error);
    return false;
  }
}
