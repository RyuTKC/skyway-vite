import { SkyWayStreamFactory } from '@skyway-sdk/room';
import { getElements, onClickJoin, tokenCreator } from './skyway';

(async () => {
  const token = tokenCreator()
  const { buttonArea, remoteMediaArea, roomNameInput, myId, joinButton, localVideo } = getElements()

  if (!(localVideo instanceof HTMLVideoElement))
    return
  if (!(joinButton instanceof HTMLButtonElement))
    return
  if (!(roomNameInput instanceof HTMLInputElement))
    return
  if (!(myId instanceof HTMLSpanElement))
    return
  if (!(buttonArea instanceof HTMLDivElement))
    return
  if (!(remoteMediaArea instanceof HTMLDivElement))
    return

  // local play
  const localStream = await SkyWayStreamFactory.createMicrophoneAudioAndCameraStream();
  localStream.video.attach(localVideo);
  await localVideo.play();
  // join button function
  joinButton.onclick = async () => await onClickJoin(roomNameInput, token, myId, localStream, remoteMediaArea, buttonArea)


})();