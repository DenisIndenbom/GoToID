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

(function () {
    template = ""

    const scope = new URLSearchParams(decodeURIComponent(window.location.search)).get('scope');
    const scope_list = document.getElementById('scope-list');

    scope.split(' ').forEach(element => {
        const li_item = document.createElement('li');
        const input_item = document.createElement('input');
        const label_item = document.createElement('label');

        li_item.classList.add('list-group-item');

        input_item.setAttribute('class', 'form-check-input me-2');
        input_item.setAttribute('id', element);
        input_item.setAttribute('type', 'checkbox');
        input_item.setAttribute('checked', null);
        label_item.setAttribute('class', 'form-check-label');
        label_item.setAttribute('for', element);

        input_item.onclick = () => {return false;}
        label_item.textContent = element;

        li_item.appendChild(input_item);
        li_item.appendChild(label_item);
        scope_list.appendChild(li_item);
    });
})();