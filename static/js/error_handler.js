(() => {
    const urlParams = new URLSearchParams(decodeURIComponent(window.location.search));
    const error = urlParams.get("success") === "false";
    if (error) {
        for (const [key, value] of urlParams) {
            const input = document.body.querySelector(`input[name=${key}]`);
            if (!input) continue;
            if (value) input.value = value;
        }

        if (urlParams.get('unique') === 'false')
            document.body.querySelector('.username-warning').style.cssText = 'visibility: visible; display: block;';

        if (urlParams.get('wrong_code') === 'true')
            document.body.querySelector('.code-warning').style.cssText = 'visibility: visible; display: block;';
	}
})()