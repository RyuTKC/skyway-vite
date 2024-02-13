// import { SkyWayStreamFactory } from '@skyway-sdk/room';
import "./main.css"
// import { createChat, tokenCreator } from './skyway-room';
// import { createChat as createChatCore, tokenCreator as tokenCreatorCore } from "./skyway-core";
import { createChat as createChatCoreClient } from "./skyway-core-client";

// const initializeRoom = async () => {
//   const token = tokenCreator()
//   await createChat(token)

// };

// const initializeCore = async()=>{
//   const token = tokenCreatorCore()
//   await createChatCore(token)
// }

const initializeCoreClient = async()=>{
  await createChatCoreClient()
}

(initializeCoreClient())