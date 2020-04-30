const socket = io()

// elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // new message element
    const $newMessage = $messages.lastElementChild

    // height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // visible height
    const visibleHeight = $messages.offsetHeight
    
    // height of messages container
    const containerHeight = $messages.scrollHeight

    // how far have i scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
    
}

socket.on('message', (clientMessage) => {
    console.log(clientMessage)
    const html = Mustache.render(messageTemplate, { 
        username: clientMessage.username.toUpperCase(),
        clientMessage: clientMessage.text,
        createdAt: moment(clientMessage.createdAt).format('HH:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (locationURL) => {
    console.log(locationURL)
    const html = Mustache.render(locationMessageTemplate, { 
        username: locationURL.username.toUpperCase(),
        locationURL: locationURL.url,
        createdAt: moment(locationURL.createdAt).format('HH:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html    
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const typedMsg = e.target.elements.userMessage.value

    socket.emit('sendMessage', typedMsg, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) return console.log(error)

        console.log('Sent ✔️')
    })
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) return alert('Geolocation is not supported by your browser.')

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        const location = {
            lat: position.coords.latitude,
            long: position.coords.longitude
        }

        socket.emit('sendLocation', location, () => {
            $sendLocationButton.removeAttribute('disabled')

            console.log('Shared ✔️')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})