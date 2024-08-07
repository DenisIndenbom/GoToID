(() => {
    avatar = document.getElementById('avatar')
    field = document.getElementById('avatarURL')

    default_path = '/static/images/goto_man.jpg'

    avatar.onerror = () => {
        avatar.src = default_path
    }

    field.onchange = () => {
        if (field) avatar.src = field.value
    }
})()