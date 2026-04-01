import { env } from "../config/env.js";

export async function getSupersetGuestToken(
  dashboardId: string,
): Promise<string> {
  const loginRes = await fetch(`${env.supersetUrl}/api/v1/security/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: env.supersetAdminUser,
      password: env.supersetAdminPassword,
      provider: "db",
    }),
  });
  if (!loginRes.ok) {
    throw new Error(`Superset login failed: ${loginRes.status} ${loginRes.statusText}`);
  }
  const { access_token: accessToken } = (await loginRes.json()) as {
    access_token: string;
  };

  const csrfRes = await fetch(
    `${env.supersetUrl}/api/v1/security/csrf_token/`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  if (!csrfRes.ok) {
    throw new Error(`Superset CSRF token fetch failed: ${csrfRes.status} ${csrfRes.statusText}`);
  }
  const { result: csrfToken } = (await csrfRes.json()) as { result: string };

  const guestTokenRes = await fetch(
    `${env.supersetUrl}/api/v1/security/guest_token/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({
        user: {
          username: "powerboard_embed",
          first_name: "PowerBoard",
          last_name: "User",
        },
        resources: [{ type: "dashboard", id: dashboardId }],
        rls: [],
      }),
    },
  );
  if (!guestTokenRes.ok) {
    throw new Error(`Superset guest token fetch failed: ${guestTokenRes.status} ${guestTokenRes.statusText}`);
  }
  const { token } = (await guestTokenRes.json()) as { token: string };

  return token;
}
