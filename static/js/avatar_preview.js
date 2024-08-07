(() => {
    avatar = document.getElementById('avatar')
    field = document.getElementById('avatarURL')

    avatar.src = '/static/images/goto_man.jpg'

    avatar.onerror = () => {
        avatar.src = '/static/images/goto_man.jpg'
    }

    field.onchange = () => {
        if (field) avatar.src = field.value
    }
})()