(() => {
    const urlParams = new URLSearchParams(decodeURI(window.location.search));
    const error = urlParams.get("success") === "false";
    
    if (error) {
        for (const [key, value] of urlParams) {
            const input = document.body.querySelector(`input[name=${key}]`);
            if (!input) continue;
            if (value) input.value = value;
        }
	}
})()