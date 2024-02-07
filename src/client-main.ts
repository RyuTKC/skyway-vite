// import { SkyWayStreamFactory } from '@skyway-sdk/room';
import "./main.css"
import { getElements, tokenCreator } from './skyway';

const initialize = async () => {
  const token = tokenCreator()
  await getElements(token)

  // local play
  // const localStream = await SkyWayStreamFactory.createMicrophoneAudioAndCameraStream();
  // localStream.video.attach(localVideo);
  // await localVideo.play();
  // join button function
};


(initialize())