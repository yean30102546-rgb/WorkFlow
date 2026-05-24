/* eslint-disable @typescript-eslint/no-explicit-any */
export const getLiffUrl = () => {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID || '2010014752-ROHB4xAL';
  return `https://liff.line.me/${liffId}`;
};

export const createFlexMessageCall = (job: any) => {
  const liffUrl = getLiffUrl();
  return {
    type: "flex" as const,
    altText: `📢 [Forklift Call] มีคำขอเรียกฟอร์คลิฟต์แบทช์ ${job.itemDetails.batchNumber}`,
    contents: {
      type: "bubble" as const,
      header: {
        type: "box" as const,
        layout: "vertical" as const,
        backgroundColor: "#0284c7",
        contents: [
          {
            type: "text" as const,
            text: "SFC Excellence",
            weight: "bold" as const,
            color: "#e0f2fe",
            size: "sm" as const
          },
          {
            type: "text" as const,
            text: "🚨 ใบสั่งงานฟอร์คลิฟต์",
            weight: "bold" as const,
            color: "#ffffff",
            size: "lg" as const,
            margin: "xs" as const
          }
        ]
      },
      body: {
        type: "box" as const,
        layout: "vertical" as const,
        spacing: "md" as const,
        contents: [
          {
            type: "box" as const,
            layout: "horizontal" as const,
            contents: [
              { type: "text" as const, text: "หมายเลขแบทช์", color: "#64748b", size: "sm" as const, flex: 2 },
              { type: "text" as const, text: job.itemDetails.batchNumber, color: "#0f172a", size: "sm" as const, weight: "bold" as const, flex: 3 }
            ]
          },
          {
            type: "box" as const,
            layout: "horizontal" as const,
            contents: [
              { type: "text" as const, text: "ชื่อสินค้า", color: "#64748b", size: "sm" as const, flex: 2 },
              { type: "text" as const, text: job.itemDetails.itemName, color: "#0f172a", size: "sm" as const, weight: "bold" as const, wrap: true, flex: 3 }
            ]
          },
          {
            type: "box" as const,
            layout: "horizontal" as const,
            contents: [
              { type: "text" as const, text: "จุดรับสินค้า", color: "#64748b", size: "sm" as const, flex: 2 },
              { type: "text" as const, text: job.itemDetails.storagePosition, color: "#eab308", size: "sm" as const, weight: "bold" as const, flex: 3 }
            ]
          },
          {
            type: "box" as const,
            layout: "horizontal" as const,
            contents: [
              { type: "text" as const, text: "จุดส่งมอบ", color: "#64748b", size: "sm" as const, flex: 2 },
              { type: "text" as const, text: job.endPoint, color: "#0284c7", size: "sm" as const, weight: "bold" as const, flex: 3 }
            ]
          }
        ]
      },
      footer: {
        type: "box" as const,
        layout: "vertical" as const,
        spacing: "sm" as const,
        contents: [
          {
            type: "button" as const,
            style: "primary" as const,
            height: "sm" as const,
            color: "#0284c7",
            action: {
              type: "uri" as const,
              label: "รับงาน (Claim Task)",
              uri: `${liffUrl}?role=driver&action=claim&jobId=${job.id}`
            }
          },
          {
            type: "button" as const,
            style: "secondary" as const,
            height: "sm" as const,
            action: {
              type: "uri" as const,
              label: "ดูข้อมูลทั้งหมด",
              uri: `${liffUrl}?role=driver`
            }
          }
        ]
      }
    }
  };
};

export const createFlexMessageComplete = (job: any) => {
  const liffUrl = getLiffUrl();
  return {
    type: "flex" as const,
    altText: `✅ [Delivered] นำส่งสินค้าสำเร็จแล้วแบทช์ ${job.itemDetails.batchNumber}`,
    contents: {
      type: "bubble" as const,
      header: {
        type: "box" as const,
        layout: "vertical" as const,
        backgroundColor: "#16a34a",
        contents: [
          {
            type: "text" as const,
            text: "SFC Excellence",
            weight: "bold" as const,
            color: "#dcfce7",
            size: "sm" as const
          },
          {
            type: "text" as const,
            text: "✅ ส่งมอบสินค้าสำเร็จ",
            weight: "bold" as const,
            color: "#ffffff",
            size: "lg" as const,
            margin: "xs" as const
          }
        ]
      },
      body: {
        type: "box" as const,
        layout: "vertical" as const,
        spacing: "md" as const,
        contents: [
          {
            type: "box" as const,
            layout: "horizontal" as const,
            contents: [
              { type: "text" as const, text: "หมายเลขแบทช์", color: "#64748b", size: "sm" as const, flex: 2 },
              { type: "text" as const, text: job.itemDetails.batchNumber, color: "#0f172a", size: "sm" as const, weight: "bold" as const, flex: 3 }
            ]
          },
          {
            type: "box" as const,
            layout: "horizontal" as const,
            contents: [
              { type: "text" as const, text: "ชื่อสินค้า", color: "#64748b", size: "sm" as const, flex: 2 },
              { type: "text" as const, text: job.itemDetails.itemName, color: "#0f172a", size: "sm" as const, weight: "bold" as const, wrap: true, flex: 3 }
            ]
          },
          {
            type: "box" as const,
            layout: "horizontal" as const,
            contents: [
              { type: "text" as const, text: "สถานะ", color: "#64748b", size: "sm" as const, flex: 2 },
              { type: "text" as const, text: "ส่งสินค้าสำเร็จ (Delivered)", color: "#16a34a", size: "sm" as const, weight: "bold" as const, flex: 3 }
            ]
          }
        ]
      },
      footer: {
        type: "box" as const,
        layout: "vertical" as const,
        spacing: "sm" as const,
        contents: [
          {
            type: "button" as const,
            style: "primary" as const,
            height: "sm" as const,
            color: "#16a34a",
            action: {
              type: "uri" as const,
              label: "ดูสถานะคิวงานทั้งหมด",
              uri: `${liffUrl}`
            }
          }
        ]
      }
    }
  };
};

export const shareToLine = async (liff: any, job: any, type: 'call' | 'complete') => {
  if (!liff) {
    alert('ระบบ LINE LIFF ยังไม่เริ่มทำงาน หรือเปิดผ่านโปรแกรมจำลอง LINE Bot (LINE Simulator) ด้านขวาล่างได้');
    return false;
  }

  if (!liff.isLoggedIn()) {
    liff.login();
    return false;
  }

  try {
    if (!liff.isApiAvailable('shareTargetPicker')) {
      alert('ฟีเจอร์แชร์การ์ดไม่รองรับในเบราว์เซอร์นี้ กรุณาเปิดผ่านแอป LINE หรือใช้โปรแกรมจำลอง LINE Simulator');
      return false;
    }

    const message = type === 'call' ? createFlexMessageCall(job) : createFlexMessageComplete(job);
    await liff.shareTargetPicker([message]);
    return true;
  } catch (error) {
    console.error('Error sharing via target picker:', error);
    alert('เกิดข้อผิดพลาดในการส่งข้อมูลเข้า LINE');
    return false;
  }
};
