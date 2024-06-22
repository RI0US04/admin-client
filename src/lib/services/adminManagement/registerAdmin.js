import { ADMIN_HTTP_API_ENDPOINT } from "$lib/const";
import { getSessionCookie, removeSessionCookie } from "$lib/cookies/sessionCookie";
import { getUsernameCookie, removeUsernameCookie } from "$lib/cookies/usernameCookie";

/**
 * @param {string} username
 * @param {string} password
 * @param {string} email
 */
export async function registerAdmin(username, password, email) {
    try {
        const response = await fetch(`${ADMIN_HTTP_API_ENDPOINT}/api-adpanel/register-admin/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'session-token': getSessionCookie() ?? "",
            },
            body: JSON.stringify({
                self_username: getUsernameCookie(),
                username: username,
                password: password,
                email: email
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
            throw new Error('Register new admin failed');
        }
    } catch (error) {
        // @ts-ignore
        throw new Error('Error registering new admin: ' + error.message);
    }
}