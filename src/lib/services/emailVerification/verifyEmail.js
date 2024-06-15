import { ADMIN_HTTP_API_ENDPOINT } from "$lib/const";
import Cookies from "js-cookie";

/**
 * @param {string} tokenID
 * @param {string} token
 * @param {string} csrfToken
 * @param {string} cloudflareToken
 */
export async function verifyEmail(tokenID, token, csrfToken, cloudflareToken) {
    try {
        const response = await fetch(`${ADMIN_HTTP_API_ENDPOINT}/api-adpanel/verify-email/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                id: tokenID,
                token: token,
                cloudflare_token: cloudflareToken
            })
        });

        // CSRF Token might have expired
        if (response.status == 403) {
            Cookies.remove("registration_csrf_token")
        }

        if (response.ok || (response.status >= 400 && response.status < 500)) {
            const data = await response.json();
            return data;
        } else {
            throw new Error('Verify Email failed');
        }
    } catch (error) {
        // @ts-ignore
        throw new Error('Error Verify Email: ' + error.message);
    }
}
