import Cookies from 'js-cookie'

export const getUsernameCookie = () => Cookies.get('session_username')

/**
 * @param {string} username 
 * @param {number} expireInDays 
 */
export const setUsernameCookie = (username, expireInDays = 31) => Cookies.set('session_username', username, { expires: expireInDays, sameSite: 'strict'})

export const removeUsernameCookie = () => Cookies.remove('session_username', { sameSite: 'strict'})