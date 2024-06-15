import { ADMIN_HTTP_API_ENDPOINT } from "$lib/const";
import { getSessionCookie, removeSessionCookie } from "$lib/cookies/sessionCookie";
import { getUsernameCookie, removeUsernameCookie } from "$lib/cookies/usernameCookie";

/**
 * @param {string} oldPassword
 * @param {string} newPassword
 * @param {string} totpCode
 */
export async function changeUserPassword(oldPassword, newPassword, totpCode) {
    try {
        const response = await fetch(`${ADMIN_HTTP_API_ENDPOINT}/api-adpanel/change-password/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'session-token': getSessionCookie() ?? '',
            },
            redirect: 'follow',
            body: JSON.stringify({
                username: getUsernameCookie(),
                current_password: oldPassword,
                password: newPassword,
                totp_code: totpCode,
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
            throw new Error('Login failed');
        }
    } catch (error) {
        // @ts-ignore
        throw new Error('Error login: ' + error.message);
    }
}
