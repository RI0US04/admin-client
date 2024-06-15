import { ADMIN_HTTP_API_ENDPOINT } from "$lib/const";
import { getSessionCookie, removeSessionCookie } from "$lib/cookies/sessionCookie";
import { getUsernameCookie, removeUsernameCookie } from "$lib/cookies/usernameCookie";

/**
 * @param {string} tokenID
 * @param {string} token
 */
export async function verifyChangeEmail(tokenID, token) {
    try {
        const response = await fetch(`${ADMIN_HTTP_API_ENDPOINT}/api-adpanel/confirm-email-change/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'session-token': getSessionCookie() ?? "",
            },
            body: JSON.stringify({
                tokenID: tokenID,
                token: token,
                username: getUsernameCookie(),
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
            throw new Error('Confirm New Email failed');
        }
    } catch (error) {
        // @ts-ignore
        throw new Error('Error Confirm New Email: ' + error.message);
    }
}
