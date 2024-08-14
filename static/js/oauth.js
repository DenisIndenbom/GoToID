(function () {
    const urlParams = new URLSearchParams(decodeURIComponent(window.location.search));
    [
        "client_id",
        "redirect_uri",
        "response_type",
        "grant_type",
        "state",
        "scope",
    ].forEach((type) => {
        const input = document.body.querySelector(`input[name=${type}]`);
        const value = urlParams.get(type);
        input.value = value;
    })
})();