import { ADMIN_HTTP_API_ENDPOINT } from "$lib/const";
import Cookies from "js-cookie";

function _getAuthenticationTokenFromCookie(){
    return Cookies.get("registration_csrf_token")
}

/**
 * @param {string} newToken
 */
function _setAuthenticationToken(newToken){
    Cookies.set('registration_csrf_token', newToken, { expires: 0.005, sameSite: "strict" }) // Expire after 1 hour...
}

/**
 * Fetch current CSRF Token for user registration form.
 * If it doesnt, it requests from the server a new token that is tied to the user's basic browser information.
 * 
 * @returns {Promise<string>} The CSRF Token, or blank if failure to fetch...
 */
export async function getUserAuthenticationCSRFToken() {

    const existingToken = _getAuthenticationTokenFromCookie()
    if (existingToken != undefined){
        return existingToken
    }

    try {
        const response = await fetch(`${ADMIN_HTTP_API_ENDPOINT}/api-adpanel/csrf_token?userAgent=${encodeURIComponent(navigator.userAgent)}`);
        if (response.ok) {
            const data = await response.json();
            _setAuthenticationToken(data.csrfToken)
            return data.csrfToken
        } else {
            console.error('Failed to get CSRF token');
            return ""
        }
    } catch (error) {
        console.error('Failed to get CSRF token:', error);
        return ""
    }
}