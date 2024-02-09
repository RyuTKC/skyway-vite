// import { SkyWayStreamFactory } from '@skyway-sdk/room';
import "./main.css"
// import { createChat, tokenCreator } from './skyway-room';
import { createChat as createChatCore, tokenCreator as tokenCreatorCore } from "./skyway-core";

// const initializeRoom = async () => {
//   const token = tokenCreator()
//   await createChat(token)

// };

const initializeCore = async()=>{
  const token = tokenCreatorCore()
  await createChatCore(token)
}


(initializeCore())