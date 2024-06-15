import { ADMIN_HTTP_API_ENDPOINT } from "$lib/const";
import { removeSessionCookie } from "$lib/cookies/sessionCookie";
import { removeUsernameCookie } from "$lib/cookies/usernameCookie";

/**
 * @param {string} username
 * @param {string} sessionToken
 */
export async function getUserInformation(username, sessionToken) {
    try {
        const response = await fetch(`${ADMIN_HTTP_API_ENDPOINT}/api-adpanel/request-user-info/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'session-token': sessionToken,
            },
            redirect: 'follow',
            body: JSON.stringify({
                username: username
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
