// import { LocalP2PRoomMember, LocalSFURoomMember, RoomPublication, RoomType, roomTypes, SkyWayRoom } from '@skyway-sdk/room';
import { LocalAudioStream, LocalStream, LocalVideoStream, nowInSec, SkyWayAuthToken, SkyWayContext, SkyWayStreamFactory, uuidV4, SkyWayChannel, Channel, LocalPerson, Publication, Logger } from '@skyway-sdk/core'
import { SfuBotMember, SfuBotPlugin } from '@skyway-sdk/sfu-bot'
import { attachVBButton } from './virtualBackground'

const env = import.meta.env

const RoomType = {
  p2p: 'p2p',
  sfu: 'sfu'
}
type RoomType = keyof typeof RoomType

const useState = <T,>(initialState: T): [() => T, (nextState: ((prev: T) => T) | T) => void] => {
  let nowState: T = initialState
  const state = () => nowState
  const test = (prev: T) => (nextState: ((prev: T) => T) | T) => {
    if (nextState instanceof Function)
      nowState = nextState(prev)
    else
      nowState = nextState

  };

  const setState = test(nowState)

  return [state, setState];
}

// skyway token
const tokenCreator = () => new SkyWayAuthToken({
  jti: uuidV4(),
  iat: nowInSec(),
  exp: nowInSec() + 60 * 60 * 24,
  scope: {
    app: {
      id: env.VITE_APP_ID,
      turn: true,
      actions: ['read'],
      channels: [
        {
          id: '*',
          name: '*',
          actions: ['write'],
          members: [
            {
              id: '*',
              name: '*',
              actions: ['write'],
              publication: {
                actions: ['write'],
              },
              subscription: {
                actions: ['write'],
              },
            },
          ],
          sfuBots: [
            {
              actions: ['write'],
              forwardings: [
                {
                  actions: ['write'],
                },
              ],
            },
          ],
        },
      ],
    },
  },
}).encode(env.VITE_SECRET_KEY);

const createChat = async () => {

  const cameras = await SkyWayStreamFactory.enumerateInputVideoDevices();
  const selectCameras = document.getElementById('select-cameras') as HTMLSelectElement
  cameras.forEach(v => {
    const newOption = document.createElement("option")
    newOption.value = v.id
    newOption.text = v.label
    selectCameras.add(newOption)
  })
  const mics = await SkyWayStreamFactory.enumerateInputAudioDevices();
  const selectMics = document.getElementById('select-mics') as HTMLSelectElement
  mics.forEach(v => {
    const newOption = document.createElement("option")
    newOption.value = v.id
    newOption.text = v.label
    selectMics.add(newOption)
  })
  const customLocalStream = {
    video: await SkyWayStreamFactory.createCameraVideoStream({ deviceId: selectCameras.value }),
    audio: await SkyWayStreamFactory.createMicrophoneAudioStream({ deviceId: selectMics.value })
  }

  const buttonArea = document.getElementById('button-area') as HTMLDivElement;
  const remoteMediaArea = document.getElementById('remote-media-area') as HTMLDivElement;
  const roomNameInput = document.getElementById('room-name') as HTMLInputElement;
  const myId = document.getElementById('my-id') as HTMLSpanElement;
  const roomType = document.getElementById('room-type') as HTMLSpanElement;

  const joinButton = document.getElementById('join') as HTMLButtonElement;
  // const localStream = await SkyWayStreamFactory.createMicrophoneAudioAndCameraStream();
  joinButton.onclick = async () => await onClickJoin(roomNameInput, myId, roomType, customLocalStream, remoteMediaArea, buttonArea, selectCommType.value as RoomType, localVideo
  )
  const localVideo = document.getElementById('local-video') as HTMLVideoElement;
  customLocalStream.video.attach(localVideo);
  await localVideo.play();

  const selectCommType = document.getElementById('select-communication-type') as HTMLSelectElement
  Object.entries(RoomType).map(v => {
    const newOption = document.createElement("option");
    newOption.value = v[1]
    newOption.text = v[1]
    selectCommType.add(newOption)
  })

  return { buttonArea, remoteMediaArea, roomNameInput, myId, joinButton, localVideo, select: selectCommType }
}

// subuscribe function
const subscribeAndAttach = (me: LocalPerson, publication: Publication<LocalStream>, remoteMediaArea: HTMLDivElement, buttonArea: HTMLDivElement, select: RoomType) => {
  // exclude me
  if (publication.publisher.id === me.id) return;

  if (publication.publisher.subtype === RoomType.sfu && (me.publications.find(v => publication.origin?.id === v.id))) return;

  if (select === 'sfu' && publication.publisher.subtype !== RoomType.sfu) return;


  // add subscribe target
  const buttonGroupAreaId = `${publication.publisher.id}-button-group`
  let getButtonGroupArea = document.getElementById(buttonGroupAreaId)
  const buttonGroupArea = getButtonGroupArea === null ? document.createElement("div") : getButtonGroupArea as HTMLDivElement
  buttonGroupArea.className = "flex flex-col"
  buttonGroupArea.id = buttonGroupAreaId;

  const remoteMediaGroupAreaId = `${publication.publisher.id}-media-group`
  let getRemoteMediaGroupArea = document.getElementById(remoteMediaGroupAreaId);
  const remoteMediaGroupArea = getRemoteMediaGroupArea === null ? document.createElement("div") : getRemoteMediaGroupArea as HTMLDivElement
  remoteMediaGroupArea.className = "flex flex-col"
  remoteMediaGroupArea.id = remoteMediaGroupAreaId

  remoteMediaArea.appendChild(remoteMediaGroupArea);
  buttonArea.appendChild(buttonGroupArea)

  const subscribeButton = document.createElement('button');
  subscribeButton.textContent = `${publication.publisher.id}: ${publication.contentType}`;
  subscribeButton.className = `${publication.id}`
  buttonGroupArea.appendChild(subscribeButton);
  // onclick event
  subscribeButton.onclick = async () => onClickSubscribe(me, publication, remoteMediaGroupArea)
};

const onClickSubscribe = async (me: LocalPerson, publication: Publication, remoteMediaGroupArea: HTMLElement) => {

  const { stream } = await me.subscribe(publication.id);

  // add others media
  let newMedia;
  switch (stream.contentType) {
    case 'video':
      newMedia = document.createElement('video');
      newMedia.playsInline = true;
      newMedia.autoplay = true;
      break;
    case 'audio':
      newMedia = document.createElement('audio');
      newMedia.controls = true;
      newMedia.autoplay = true;
      break;
    default:
      return;
  }


  stream.attach(newMedia);
  newMedia.className = `${publication.id}`
  remoteMediaGroupArea.appendChild(newMedia);
};

interface CustomRoom extends Channel {
  type: RoomType
}

const FindOrCreate = async (context: SkyWayContext, info: { name: string, type: RoomType }) => {
  const channel = await SkyWayChannel.FindOrCreate(context, {
    name: info.name,
    metadata: info.type
  })

  // spreadするとjoin関数が消える
  const room: CustomRoom = { ...channel, type: info.type }
  console.log(channel.join)
  console.log(room.join)

  return { channel: channel, type: info.type }
}

const onClickJoin = async (roomNameInput: HTMLInputElement,
  myId: HTMLSpanElement, roomType: HTMLSpanElement,
  localStream: { video: LocalVideoStream, audio: LocalAudioStream },
  remoteMediaArea: HTMLDivElement, buttonArea: HTMLDivElement, select: RoomType, localVideo: HTMLVideoElement) => {
  if (roomNameInput.value === '') return;


  // fetch token
  const token = await getToken(roomNameInput.value)


  const { video, audio } = localStream
  // create context
  const context = await SkyWayContext.Create(token.token, { log: { level: 'info' || 'warn' || 'error', format: 'string' } });


  Logger.onLog = ({ level, timestamp, message, id }) => {
    console.log("level:", level, "\n",
      "timestamp:", timestamp, "\n",
      "message:", message.join(), "\n",
      "id: ", id)
  }

  //add sfuBot plugin
  const sfuPlugin = new SfuBotPlugin()
  context.registerPlugin(sfuPlugin)

  // create or find a room
  const room = await FindOrCreate(context, {
    name: roomNameInput.value,
    type: select
  })
  const sfuBot = room.type === 'sfu' ? await sfuPlugin.createBot(room.channel) : undefined;

  // me id
  const me = await room.channel.join();
  myId.textContent = me.id;
  roomType.textContent = room.type;
  // publish
  const audioPub = await me.publish(audio);
  const videoPub = await me.publish(video, {
    encodings: [
      { scaleResolutionDownBy: 1, id: 'high', maxBitrate: 400_000, maxFramerate: 30 },
      { scaleResolutionDownBy: 4, id: 'low', maxBitrate: 80_000, maxFramerate: 5 },
    ]
  });


  sfuBot && await sfuForward(sfuBot, audioPub, videoPub)

  //mute and display sharing
  const localResourcesArea = document.getElementById("local-resources")
  if (localResourcesArea instanceof HTMLDivElement) {

    // mute
    const muteButton = document.createElement("button")
    localResourcesArea.appendChild(muteButton)
    const micIcon = document.createElement("span")
    micIcon.className = "material-symbols-outlined"
    micIcon.textContent = "mic"
    muteButton.appendChild(micIcon)
    muteButton.onclick = async () => {
      const audios = me.publications.filter(v => v.contentType === 'audio')
      await audios.forEach(async v => {
        switch (v.state) {
          case 'enabled':
            await v.disable()
            micIcon.textContent = "mic_off"
            break;
          case 'disabled':
          default:
            await v.enable()
            micIcon.textContent = "mic"
            break;
        }
      })
    }

    // display sharing
    const castButton = document.createElement("button")
    localResourcesArea.appendChild(castButton)
    const castIcon = document.createElement("span")
    castIcon.className = "material-symbols-outlined"
    castIcon.textContent = "cast"
    castButton.appendChild(castIcon)

    const [share, setShare] = useState<{ stream: LocalVideoStream, publishId: string } | undefined>(undefined)
    castButton.onclick = async () => {
      const startShare = async () => {
        const shareStream = await SkyWayStreamFactory.createDisplayStreams()
        const sharePub = await me.publish(shareStream.video)
        sfuBot && sfuForward(sfuBot, sharePub)

        shareStream.video.track.onended = async () => await stopShare(sharePub)
        setShare({ stream: shareStream.video, publishId: sharePub.id })
        castButton.className = "bg-sky-200"

      }
      const stopShare = async (sharePub?: Publication<LocalStream>) => {
        share()?.stream.release()
        sharePub && await me.unpublish(sharePub)
        setShare(undefined)
        castButton.className = ""
      }

      if (!share()) {
        await startShare()
      } else {
        const sharePub = me.publications.find(v => v.id === share()?.publishId)

        sharePub && (async () => {
          await stopShare(sharePub)
        })()
      }
    }

    // virtual background
    attachVBButton(localResourcesArea, localVideo, videoPub)
  }

  // add subscribe components every publication
  room.channel.publications.forEach(v => subscribeAndAttach(me, v, remoteMediaArea, buttonArea, select));
  // publish event
  room.channel.onStreamPublished.add((e) => {
    // subscribe
    subscribeAndAttach(me, e.publication, remoteMediaArea, buttonArea, select);
  });

  room.channel.onStreamUnpublished.add((e) => {
    const elements = document.getElementsByClassName(e.publication.id)
    Array.from(elements).forEach(v => v.remove())
  })
}

const sfuForward = async (bot: SfuBotMember, ...publications: Publication<LocalAudioStream | LocalVideoStream>[]) => {
  await publications.forEach(async v => await bot.startForwarding(v))
}


const getToken = async (channelName: string) => {
  return await fetch(`/.netlify/functions/token?channelName=${channelName}`, { headers: { "Content-Type": "text/plain;charset=UTF-8" } })
    .then(async res => {
      const token = await res.json() as {token: string}
      console.log(token)
      return token
    })
    .catch(e => { throw e})
}

export { tokenCreator, createChat, subscribeAndAttach, onClickJoin }