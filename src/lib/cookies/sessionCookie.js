import Cookies from 'js-cookie'

export const getSessionCookie = () => Cookies.get('session_token')

/**
 * Set a session token into the cookie...
 * @param {string} sessionToken 
 * @param {number} expireInDays 
 */
export const setSessionCookie = (sessionToken, expireInDays = 7) => Cookies.set('session_token', sessionToken, { expires: expireInDays, sameSite: 'strict'})

export const removeSessionCookie = () => Cookies.remove('session_token', { sameSite: 'strict'})
