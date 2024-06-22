import { ADMIN_HTTP_API_ENDPOINT } from "$lib/const";
import { getSessionCookie, removeSessionCookie } from "$lib/cookies/sessionCookie";
import { getUsernameCookie, removeUsernameCookie } from "$lib/cookies/usernameCookie";

/**
 * @param {string} userID
 */
export async function revokeUserTOTP(userID) {
    try {
        const response = await fetch(`${ADMIN_HTTP_API_ENDPOINT}/api-adpanel/revoke-user-totp/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'session-token': getSessionCookie() ?? "",
            },
            body: JSON.stringify({
                self_username: getUsernameCookie(),
                target_user_id: userID
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
            throw new Error('Revoke TOTP failed');
        }
    } catch (error) {
        // @ts-ignore
        throw new Error('Error Request revoke user TOTP: ' + error.message);
    }
}