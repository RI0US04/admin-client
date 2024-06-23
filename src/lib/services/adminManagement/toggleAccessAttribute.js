import { ADMIN_HTTP_API_ENDPOINT } from "$lib/const";
import { getSessionCookie, removeSessionCookie } from "$lib/cookies/sessionCookie";
import { getUsernameCookie, removeUsernameCookie } from "$lib/cookies/usernameCookie";

/**
 * @param {string} userID
 * @param {any} accessAttribute
 */
export async function toggleAccessAttribute(userID, accessAttribute) {
    try {
        const response = await fetch(`${ADMIN_HTTP_API_ENDPOINT}/api-adpanel/toggle-admin-access/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'session-token': getSessionCookie() ?? "",
            },
            body: JSON.stringify({
                self_username: getUsernameCookie(),
                target_user_id: userID,
                access_attribute: accessAttribute
            })
        });

        if (response.status == 401) {
            removeSessionCookie();
            removeUsernameCookie();
        }

        if (response.ok || (response.status >= 400 && response.status < 500)) {
            const data = await response.json();
            return data;
        } else {
            throw new Error('toggleAccessAttribute failed');
        }
    } catch (error) {
        // @ts-ignore
        throw new Error('Error Request toggleAccessAttribute: ' + error.message);
    }
}