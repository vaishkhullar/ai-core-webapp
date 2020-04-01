class Client {
    constructor(user_id, setStreams) {
        this.setStreams = setStreams
        this.websocket = new WebSocket('wss://58f6e9lwd7.execute-api.eu-west-2.amazonaws.com/prod')
        this.websocket.onmessage = this.handleMessage
        // this.state = {
        //     channelName: null,
        //     screenshareChannelName: null,
        //     user_id: null,
        //     lobbies: [],
        //     localStream: null,
        //     currentLobby: null,
        //     remoteStreams: {},
        //     viewers: {}
        // }
        this.user_id = user_id

        this.interval = setInterval(()=>{
            if (this.websocket.readyState == 1) {
                clearInterval(this.interval)
                this.interval = null
                this.getSignalingChannel()
            }
        }, 1000)
    }

    getSignalingChannel = async () => {
        this.websocket.send(JSON.stringify({
            action: 'get-signaling-channel',
            user_id: this.state.user_id
        }))
    }

    setSignalingChannel = async (channels) => {
        this.signaling_channel = channels.signaling_channel
            this.startStreaming() 
    }

    startStreaming = async () => {
        let webcam
        if (navigator.mediaDevices.getUserMedia) {
            webcam = await navigator.mediaDevices.getUserMedia(webcamOptions);
        } 
        this.webcam = webcam
        this.master = new Master(
            webcam,
            null,
            this.signaling_channel,
            (message)=>{console.log('REMOTE MESSAGE FROM CLIENT MASTER:', message)},
            (e)=>{console.log('[MASTER] stats report:', e)},
        )
    }

    requestJoinLobby = (lobby_id) => {
        this.websocket.send(JSON.stringify({
            action: 'join-lobby',
            lobby_id,
            user_id: this.state.user_id,
        }))
    }

    joinLobby = (lobby) => {
        this.currentLobby = lobby
        for (var channels of Object.values(lobby.members).flat()) {
            console.log(channels)
            Object.values(channels).forEach(channel=>{
                this.joinChannel(channel)
            })
        }
    }

    joinChannel = async (channel) => {
        if (channel == this.signaling_channel) {return} // don't join yourself
        if (!Object.keys(this.viewers).includes(channel)) {
            this.setViewer(channel)
        }
    }

    setViewer = (channel) => {
        console.log(channel)
        console.log(this.signaling_channel)
        if (channel == this.signaling_channel) {return}
        if (this.viewers[channel] != null) {  // if a viewer already exists for this channel
            this.viewers[channel].stopViewer() // stop the viewer before overwriting it
        }
        this.viewers = {
            ...this.state.viewers,
            [channel]: new Viewer(  // create new viewer
                channel,
                (newStreams) => {this.setStreams(newStreams, channel)},
                (e)=>{console.log(`remote data message from viewer ${channel}:`, e)},
                (e)=>{console.log(`stats report from viewer ${channel}:`, e)},
            )
        }
    }

    leaveLobby = () => {
        this.websocket.send(JSON.stringify({
            action: 'leave-lobby',
            user_id: this.state.user_id,
            lobby_id: this.state.currentLobby.lobby_id
        }))
        // this.state.master.stopMaster() // stop streaming from here
        Object.values(this.viewers).forEach(viewer=>viewer.stopViewer()) // stop all viewers
    }

    handleMessage = (message) =>{
        var body = JSON.parse(message.data)
        console.log(body)
        switch (body.type) {
            case 'get-signaling-channel':
                this.setSignalingChannel(body.content)
                return
            case "join-lobby":
                let lobby = body.content
                // this.state.master.stopMaster()
                this.leaveLobby()
                this.joinLobby(lobby)
                return
            case "member-left-lobby":
                return
            case "member-joined-lobby":
                return
            default:
                console.error('message type not recognised:')
                // console.error(body)
        }
    }
}

export default Client