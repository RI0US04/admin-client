/**
 * @param {string} url
 * @param {number} delay
 */
export default function delayedNavigate(url, delay = 1750) {
    setTimeout(() => {
        window.location.href = url;
    }, delay);
}