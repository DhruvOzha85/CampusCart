/**
 * Client-side visitor and demo student profile management.
 * Strictly executes on the browser via localStorage.
 */

export function getVisitorId() {
  if (typeof window === "undefined") return "";

  try {
    let visitorId = localStorage.getItem("campuscart_visitor_id");
    if (!visitorId) {
      visitorId = `v_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem("campuscart_visitor_id", visitorId);
    }
    return visitorId;
  } catch (e) {
    return "guest_fallback";
  }
}

export function getStoredStudent() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("campuscart_student_profile");
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to parse stored student profile:", e);
  }
  return null;
}

export function setStoredStudent(profile) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("campuscart_student_profile", JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save student profile:", e);
  }
}

export function clearStoredStudent() {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem("campuscart_student_profile");
  } catch (e) {
    console.error("Failed to clear student profile:", e);
  }
}

