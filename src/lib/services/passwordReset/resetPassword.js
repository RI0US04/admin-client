import { ADMIN_HTTP_API_ENDPOINT } from "$lib/const";

/**
 * @param {string} username
 * @param {string} cloudflareToken
 * @param {string} csrfToken
 */
export async function resetPassword(username, cloudflareToken, csrfToken) {
    try {
        const response = await fetch(`${ADMIN_HTTP_API_ENDPOINT}/api-adpanel/reset-password/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            redirect: 'follow',
            body: JSON.stringify({
                username: username,
                cloudflare_token: cloudflareToken
            })
        });

        if (response.ok || (response.status >= 400 && response.status < 500)) {
            const data = await response.json();
            return data;
        } else {
            throw new Error('Request disable TOTP failed');
        }
    } catch (error) {
        // @ts-ignore
        throw new Error('Error request disable TOTP : ' + error.message);
    }
}
