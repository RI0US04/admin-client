import { ADMIN_HTTP_API_ENDPOINT } from "$lib/const";
import Cookies from "js-cookie";

/**
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @param {string} csrfToken
 * @param {string} cloudflareToken
 */
export async function registerUserAPI(username, email, password, csrfToken, cloudflareToken) {
    try {
        const response = await fetch(`${ADMIN_HTTP_API_ENDPOINT}/api-adpanel/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                userAgent: navigator.userAgent,
                username: username,
                email: email,
                password: password,
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
            throw new Error('Registration failed');
        }
    } catch (error) {
        // @ts-ignore
        throw new Error('Error registering: ' + error.message);
    }
}
