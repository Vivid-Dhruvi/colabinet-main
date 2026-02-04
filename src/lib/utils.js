import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getChatUtils = async (clientId, appKey) => {
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60;

  const payload = JSON.stringify({
    client_id: clientId,
    expires_at: expiresAt,
  });

  const token = btoa(payload);

  const keyBuffer = new TextEncoder().encode(appKey);
  const dataBuffer = new TextEncoder().encode(token);

  const cryptoKey = await crypto.subtle.importKey("raw", keyBuffer, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);

  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, dataBuffer);
  const signature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return {
    token,
    signature,
  };
};

export const getCurrentColor = (value) => {
  if (!value) return { background: "#22C55E", border: "#DEF6E7" };
  const colors =
    value.in_draft == 1
      ? { background: "#fac564", border: "#fff7e8" }
      : value.in_draft == 2
      ? { background: "#fac564", border: "#fff7e8" }
      : value.recurring_status == 1
      ? { background: "#22C55E", border: "#DEF6E7" }
      : value.recurring_status == 2
      ? { background: "#fac564", border: "#fff7e8" }
      : { background: "#60A5FA", border: "#E7F2FE" };
  return colors;
};

export const getRecurringStatus = (value) => {
  if (!value) return { status: "Active", class: "inprogress-color" };

  if (value.in_draft === 1) {
    return { status: "Draft", class: "draft-color" };
  } else if (value.in_draft === 2) {
    return { status: "Archived", class: "draft-color" };
  } else if (value.in_draft === 3) {
    return { status: "Deleted", class: "draft-color" };
  } else if (value.recurring_status === 1) {
    return { status: "Paused", class: "completed-color" };
  } else if (value.recurring_status === 2) {
    return { status: "Ended", class: "draft-color" };
  } else {
    return { status: "Active", class: "inprogress-color" };
  }
};

export const getWorkflowStatus = (value) => {
  if (!value) return "Active";
  if (value.in_draft === 1) {
    return "Draft";
  } else if (value.in_draft === 2) {
    return "Archived";
  } else if (value.in_draft === 3) {
    return "Deleted";
  } else if (value.recurring_status === 1) {
    return "Paused";
  } else if (value.recurring_status === 2) {
    return "Ended";
  } else {
    return "Active";
  }
};

export const isUserAllow = (user, key) => {
  if (user?.role_id != 7) return true;
  const user_pesmission = user?.user_permission || [];
  return user_pesmission.includes(key);
};

export const isUserAllowAny = (user, key = []) => {
  if (user?.role_id != 7) return true;
  const user_pesmission = user?.user_permission || [];
  return user_pesmission.some((perm) => key.includes(perm));
};

export const notallowUserToAccess = (user, role_ids) => {
  return role_ids.includes(user?.role_id);
};

export const isBusinessOverviewAccessible = (user) => {
  if (user?.role_id != 7) return true;
  if (user?.permission_type == 0) return false;
  if (user?.user_permission.includes("hide-business-overview")) return false;
  return true;
};

export const isBusinessSetupAccessible = (user) => {
  if (user?.role_id != 7) return true;
  if (user?.permission_type == 0) return false;
  if (user?.user_permission.includes("hide-business-setup")) return false;
  return true;
};
