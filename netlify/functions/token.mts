import type { Context } from "@netlify/functions"
import { nowInSec, uuidV4 } from "@skyway-sdk/core";
import type { AuthToken, } from "@skyway-sdk/token"
import jwt from "jsonwebtoken"
import {randomUUID} from "crypto"

export default async (req: Request, context: Context) => {
  // const env = import.meta.env
  const id = process.env.VITE_APP_ID
  const secret = process.env.VITE_SECRET_KEY
  
  const channelName = context.params.channelName;
  // const memberName = context.params.memberName;
  console.log("token create!")
  console.log("analytics enabled!")
  const iat = Math.floor(Date.now() / 1000);
  const exp = Math.floor(Date.now() / 1000) + 36000;
  const token = jwt.sign({
    jti: randomUUID(),
    iat: iat,
    exp: exp,
    scope: {
      app: {
        id: id,
        turn: true,
        actions: ["read"],
        analytics: true,
        channels: [
          {
            id: "*",
            name: channelName,
            actions: ["write"],
            members: [
              {
                id: "*",
                name: "*",
                actions: ["write"],
                publication: {
                  actions: ["write"],
                },
                subscription: {
                  actions: ["write"],
                },
              },
            ],
            sfuBots: [
              {
                actions: ["write"],
                forwardings: [
                  {
                    actions: ["write"]
                  }
                ]
              }
            ]
          },
        ],
      },
    },
  },
  secret?secret:"")

  
  // // skyway token
  // uuidV4()
  // const a: AuthToken = {
  //   jti: uuidV4(""),
  //   iat: nowInSec(),
  //   exp: nowInSec() + 60 * 60 * 24,
  //   scope: {
  //     app: {
  //       id: id ? id : "",
  //       turn: true,
  //       actions: ['read'],
  //       channels: [
  //         {
  //           id: '*',
  //           name: '*',
  //           actions: ['write'],
  //           members: [
  //             {
  //               id: '*',
  //               name: '*',
  //               actions: ['write'],
  //               publication: {
  //                 actions: ['write'],
  //               },
  //               subscription: {
  //                 actions: ['write'],
  //               },
  //             },
  //           ],
  //           sfuBots: [
  //             {
  //               actions: ['write'],
  //               forwardings: [
  //                 {
  //                   actions: ['write'],
  //                 },
  //               ],
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //   },
  // }

  return Response.json({token: token})
}
