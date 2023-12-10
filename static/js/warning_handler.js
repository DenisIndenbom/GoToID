(() => {
    const urlParams = new URLSearchParams(decodeURIComponent(window.location.search));

    if (urlParams.get('unique') === 'false')
        document.body.querySelector('.unique-warning').style.cssText = 'visibility: visible; display: block;';

    if (urlParams.get('wrong_code') === 'true')
        document.body.querySelector('.code-warning').style.cssText = 'visibility: visible; display: block;';

    if (urlParams.get('wrong_password') === 'true')
        document.body.querySelector('.password-warning').style.cssText = 'visibility: visible; display: block;';
})()