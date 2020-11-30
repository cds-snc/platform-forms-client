const checkCookies = () => {
  var cookieEnabled = !!(navigator.cookieEnabled);

  if (typeof navigator.cookieEnabled === "undefined" && !cookieEnabled) {
    document.cookie = "testcookie";
    cookieEnabled = (document.cookie.indexOf("testcookie") !== -1);
  }
  return (cookieEnabled);
}

if (!checkCookies()) {
  const message = document.querySelector('.cookie-warning');

  if (message) {
    message.classList.remove('hidden')
  }
}