import { LocalAudioStream, LocalP2PRoomMember, LocalStream, LocalVideoStream, nowInSec, Room, RoomPublication, SkyWayAuthToken, SkyWayContext, SkyWayRoom, uuidV4 } from '@skyway-sdk/room';
const env = import.meta.env

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

const getElements = () => {
  // get element
  const buttonArea = document.getElementById('button-area');
  const remoteMediaArea = document.getElementById('remote-media-area');
  const roomNameInput = document.getElementById('room-name');
  const myId = document.getElementById('my-id');
  const joinButton = document.getElementById('join');
  // local video stream
  const localVideo = document.getElementById('local-video');

  return { buttonArea, remoteMediaArea, roomNameInput, myId, joinButton, localVideo }
}

// subuscribe function
const subscribeAndAttach = (me: LocalP2PRoomMember, publication: RoomPublication<LocalStream>, remoteMediaArea: HTMLDivElement, buttonArea: HTMLDivElement) => {
  // exclude me
  if (publication.publisher.id === me.id) return;

  // add subscribe target
  const subscribeButton = document.createElement('button');
  subscribeButton.textContent = `${publication.publisher.id}: ${publication.contentType}`;
  buttonArea.appendChild(subscribeButton);

  // onclick event
  subscribeButton.onclick = async () => {

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
    remoteMediaArea.appendChild(newMedia);
  };
};

const eventHandlers = (room: Room) => {

  room.onStreamPublished.add((e) => {
    e.publication
  })
  room.onClosed
}

const onClickJoin = async (roomNameInput: HTMLInputElement, token: string, myId: HTMLElement,
  localStream: { video: LocalVideoStream, audio: LocalAudioStream },
  remoteMediaArea: HTMLDivElement, buttonArea: HTMLDivElement) => {
  if (roomNameInput.value === '') return;

  const { video, audio } = localStream

  // create context
  const context = await SkyWayContext.Create(token);
  // create or find a room
  const room = await SkyWayRoom.FindOrCreate(context, {
    type: 'p2p',
    name: roomNameInput.value,
  });

  // me id
  const me = await room.join();
  myId.textContent = me.id;
  // publish
  await me.publish(audio);
  await me.publish(video);

  // add subscribe components every publication
  room.publications.forEach(v => subscribeAndAttach(me, v, remoteMediaArea, buttonArea));
  // publish event
  room.onStreamPublished.add((e) => {
    // subscribe
    subscribeAndAttach(me, e.publication, remoteMediaArea, buttonArea);
  });
}


export { tokenCreator, getElements, subscribeAndAttach, eventHandlers, onClickJoin }