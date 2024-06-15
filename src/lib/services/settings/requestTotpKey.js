import { ADMIN_HTTP_API_ENDPOINT } from "$lib/const";
import { getSessionCookie, removeSessionCookie } from "$lib/cookies/sessionCookie";
import { getUsernameCookie, removeUsernameCookie } from "$lib/cookies/usernameCookie";

export async function requestTotpKey() {
    try {
        const response = await fetch(`${ADMIN_HTTP_API_ENDPOINT}/api-adpanel/enable-totp/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'session-token': getSessionCookie() ?? "",
            },
            redirect: 'follow',
            body: JSON.stringify({
                username: getUsernameCookie() ?? ""
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
            throw new Error('Request TOTP failed');
        }
    } catch (error) {
        // @ts-ignore
        throw new Error('Error request TOTP key : ' + error.message);
    }
}
