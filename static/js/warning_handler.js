(() => {
    const urlParams = new URLSearchParams(decodeURIComponent(window.location.search));

    if (urlParams.get('unique') === 'false')
        document.body.querySelector('.unique-warning').style.cssText = 'visibility: visible; display: block;';

    if (urlParams.get('unique_tg') === 'false')
        document.body.querySelector('.unique-tg-warning').style.cssText = 'visibility: visible; display: block;';

    if (urlParams.get('wrong_code') === 'true')
        document.body.querySelector('.code-warning').style.cssText = 'visibility: visible; display: block;';

    if (urlParams.get('wrong_password') === 'true')
        document.body.querySelector('.password-warning').style.cssText = 'visibility: visible; display: block;';

    if (urlParams.get('change_password_error') === 'true')
        document.body.querySelector('.change-password-warning').style.cssText = 'visibility: visible; display: block;';
})()