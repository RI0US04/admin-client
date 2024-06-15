import { ADMIN_HTTP_API_ENDPOINT } from "$lib/const";
import Cookies from "js-cookie";

/**
 * @param {string} username
 * @param {string} csrfToken
 * @param {string} cloudflareToken
 */
export async function requestEmailVerification(username, csrfToken, cloudflareToken) {
    try {
        const response = await fetch(`${ADMIN_HTTP_API_ENDPOINT}/api-adpanel/request-email-verification-token/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                username: username,
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
            throw new Error('Request Verify Email failed');
        }
    } catch (error) {
        // @ts-ignore
        throw new Error('Error Request Verify Email: ' + error.message);
    }
}