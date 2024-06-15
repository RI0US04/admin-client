import { ADMIN_HTTP_API_ENDPOINT } from "$lib/const";

/**
 * @param {string} username
 * @param {string} recoveryCode
 * @param {string} cloudflareToken
 * @param {string} csrfToken
 */
export async function disableTotp(username, recoveryCode, cloudflareToken, csrfToken) {
    try {
        const response = await fetch(`${ADMIN_HTTP_API_ENDPOINT}/api-adpanel/disable-totp/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            redirect: 'follow',
            body: JSON.stringify({
                username: username,
                recovery_code: recoveryCode,
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
