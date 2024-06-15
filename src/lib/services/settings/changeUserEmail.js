import { ADMIN_HTTP_API_ENDPOINT } from "$lib/const";
import { getSessionCookie, removeSessionCookie } from "$lib/cookies/sessionCookie";
import { getUsernameCookie, removeUsernameCookie } from "$lib/cookies/usernameCookie";

/**
 * @param {string} password
 * @param {string} email
 * @param {string} totpCode
 */
export async function changeUserEmail(password, email, totpCode) {
    try {
        const response = await fetch(`${ADMIN_HTTP_API_ENDPOINT}/api-adpanel/change-email/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'session-token': getSessionCookie() ?? '',
            },
            redirect: 'follow',
            body: JSON.stringify({
                username: getUsernameCookie(),
                password: password,
                new_email: email,
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
