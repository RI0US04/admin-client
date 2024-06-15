import { ADMIN_HTTP_API_ENDPOINT } from "$lib/const";

/**
 * @param {string} tokenID
 * @param {string} token
 * @param {string} newPassword
 * @param {string} cloudflareToken
 * @param {string} csrfToken
 */
export async function confirmResetPassword(tokenID, token, newPassword, cloudflareToken, csrfToken) {
    try {
        const response = await fetch(`${ADMIN_HTTP_API_ENDPOINT}/api-adpanel/confirm-password-reset/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            redirect: 'follow',
            body: JSON.stringify({
                tokenID: tokenID,
                newPassword: newPassword,
                token: token,
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
