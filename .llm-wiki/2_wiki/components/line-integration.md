# Title: LINE Integration & Flex Message Sharing
[Updated: 2026-05-24]

## 1. Summary & Current Implementation
The system integrates LINE card notifications using client-side LINE LIFF `shareTargetPicker`. Instead of static/deprecated GAS backend pushes, the operator or driver can trigger a sharing action that opens the LINE client target picker, allowing them to send rich Flex Messages (custom cards) directly into LINE groups or individual driver chats.

## 2. Technical Code Snippet (Best Practice)
```typescript
// From src/lib/line.ts
export const shareToLine = async (liff: any, job: any, type: 'call' | 'complete') => {
  if (!liff) {
    alert('ระบบ LINE LIFF ยังไม่เริ่มทำงาน');
    return false;
  }
  if (!liff.isLoggedIn()) {
    liff.login();
    return false;
  }
  try {
    if (!liff.isApiAvailable('shareTargetPicker')) {
      alert('ฟีเจอร์แชร์การ์ดไม่รองรับในเบราว์เซอร์นี้ กรุณาเปิดผ่านแอป LINE');
      return false;
    }
    const message = type === 'call' ? createFlexMessageCall(job) : createFlexMessageComplete(job);
    await liff.shareTargetPicker([message]);
    return true;
  } catch (error) {
    console.error('Error sharing via target picker:', error);
    return false;
  }
};
```

## 3. Knowledge Relationships
- **Depends On**: [[components/auth-flow.md]] (Uses LINE LIFF login state and profile details).
- **Impacted By**: [[tech-stack/nextjs-drizzle.md]] (Triggered from React UI state on job creation/completion).
- **Contradicts**: Deprecated Google Apps Script backend messaging system, which sent plain text alerts rather than rich Flex Cards and was disconnected during Next.js migration.
