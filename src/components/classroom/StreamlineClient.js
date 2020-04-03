import Viewer from "./SignalingChannelViewer"
import Master from "./SignalingChannelMaster"

class Client {
    constructor(user_id, user_info, setLobby, setStreams, onReady) {
        this.user_id = user_id
        this.user_info = user_info
        this.setLobby = setLobby
        this.setStreams = setStreams
        this.websocket = new WebSocket('wss://58f6e9lwd7.execute-api.eu-west-2.amazonaws.com/prod')
        this.websocket.onmessage = this.handleMessage
        this.viewers = {}
        this.ready = false
        this.streams = {}
        this.interval = setInterval(()=>{
            if (this.websocket.readyState == 1) {
                clearInterval(this.interval)
                this.interval = null
                this.getSignalingChannel()
            }
        }, 1000)
        // this.refresh_viewers = setInterval(()=>{
        //     Object.keys(this.viewers).forEach(channel=>{
        //         if (!this.streams[channel]) { // if we not yet received streams from this channel
        //             this.setViewer(channel) // reset the viewer (SDP offer will now be made after master has been created)
        //         }
        //     })
        // }, 1000)
    }

    _setStreams = (newStreams, channel) => {
        var screenshare_channels = Object.values(this.currentLobby.members).map(info=>info.screenshare_signaling_channel)
        console.log(screenshare_channels)
        if (channel in screenshare_channels) {alert(`got screenshare from channel ${channel}`)}
        this.streams = {
            ...this.streams,
            [channel]: newStreams
        }
        this.setStreams(newStreams, channel)
    }

    getSignalingChannel = async () => {
        console.log(this.user_id)
        this.websocket.send(JSON.stringify({
            action: 'get-signaling-channel',
            user_id: this.user_id,
            user_info: this.user_info
        }))
    }

    setSignalingChannel = async (channels) => {
        this.signaling_channel = channels.signaling_channel
        this.ready = true
    }

    requestJoinLobby = (lobby_id) => {
        this.websocket.send(JSON.stringify({
            action: 'join-lobby',
            lobby_id,
            user_id: this.user_id,
        }))
        // alert('requesting lobby')
    }

    joinLobby = (lobby) => {
        this.currentLobby = lobby
        // Object.keys(lobby.members).forEach(info=>{
        //     this.joinChannel(info.signaling_channel)
        //     this.joinChannel(info.screenshare_signaling_channel)
        // })
        // for (var channels of Object.values(lobby.members)
        Object.values(lobby.members)
        .map(mem=>{return mem.signaling_channel})
        .forEach(channel=>{this.joinChannel(channel)})
        // .flat()) {
        //     console.log(channels)
        //     Object.values(channels).forEach(channel=>{
        //         this.joinChannel(channel)
        //     })
        // }
        // alert('joined lobby')
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
            ...this.viewers,
            [channel]: new Viewer(  // create new viewer
                channel,
                (newStreams) => {this._setStreams(newStreams, channel)},
                (e)=>{console.log(`remote data message from viewer ${channel}:`, e)},
                (e)=>{console.log(`stats report from viewer ${channel}:`, e)},
            )
        }
    }

    leaveLobby = () => {
        this.websocket.send(JSON.stringify({
            action: 'leave-lobby',
            user_id: this.user_id,
            lobby_id: this.currentLobby.lobby_id
        }))
        // this.master.stopMaster() // stop streaming from here
        Object.values(this.viewers).forEach(viewer=>viewer.stopViewer()) // stop all viewers
        this.currentLobby = {}
        this.setLobby(this.currentLobby)
    }

    startWebcam = (webcam) => {
        this.master = new Master(
            webcam,
            null,
            this.signaling_channel,
            (message)=>{console.log('REMOTE MESSAGE FROM CLIENT MASTER:', message)},
            (e)=>{console.log('[MASTER] stats report:', e)},
        )
    }

    stopWebcam = () => {
        this.master.stopMaster()
        this.master = null
    }

    startScreenshare = async (stream) => {
        this.master.replaceVideoStream(stream)
        // this.screenshareMaster = new Master(
        //     stream,
        //     null,
        //     this.screenshare_signaling_channel,
        //     (message)=>{console.log('REMOTE MESSAGE FROM CLIENT MASTER:', message)},
        //     (e)=>{console.log('[MASTER] stats report:', e)},
        // )
    }

    stopScreenshare = () => {
        this.master.replaceVideoStream(null)
        // this.screenshareMaster.stopMaster()
        // this.screenshareMaster = null
    }

    replaceVideoStream = (stream) => {
        this.master.replaceVideoStream(stream)
    }

    handleMessage = (message) =>{
        console.log('messsage:', message)
        var body = JSON.parse(message.data)
        console.log(body)
        switch (body.type) {
            case 'get-signaling-channel':
                this.setSignalingChannel(body.content)
                return
            case "join-lobby":
                let lobby = body.content
                // this.master.stopMaster()
                if (this.currentLobby) {this.leaveLobby()}
                this.joinLobby(lobby)
                this.setLobby(lobby)
                return
            case "member-left-lobby":
                var connection_id = body.content
                console.log(connection_id)
                console.log(this.currentLobby)
                console.log(this.viewers)
                var new_member = this.currentLobby.members[connection_id]
                var channels = [new_member.signaling_channel].filter(c=>{return c})
                console.log(channels)
                channels.forEach(channel=>{
                    console.log('removing channel:', channel)
                    this.viewers[channel].stopViewer()
                    delete this.viewers[channel]
                    this._setStreams(null, channel)
                    console.log(this.viewers)
                    console.log()
                })
                delete this.currentLobby.members[connection_id]
                console.log(this.currentLobby)
                this.setLobby(this.currentLobby)
                console.log(this.viewers)
                // alert('member left lobby')
                return
            case "member-joined-lobby":
                var new_member = body.content
                console.log(new_member)
                var connection_id = Object.keys(new_member)[0]
                this.currentLobby.members = {
                    ...this.currentLobby.members,
                    ...new_member
                }
                this.setLobby(this.currentLobby)
                var channels = [
                    new_member[connection_id].signaling_channel, 
                    new_member[connection_id].screenshare_signaling_channel
                ]
                .filter(c=>{return c})
                console.log(channels)
                channels.forEach(channel=>{
                    // alert(`joining channel: ${channel}`)
                    this.joinChannel(channel)
                })
                // alert()
                return
            default:
                console.error('message type not recognised:')
                console.error(body)
        }
    }

    close = () => {
        try {
            this.master.stopMaster() // stop master
        }catch {}
        console.log(this.viewers)
        Object.values(this.viewers).forEach(viewer=>{
            try {viewer.stopViewer()}catch{}
        }) // stop all viewers
    }
}

export default Client