import { BitFieldResolvable, GatewayIntentsString } from "discord.js";

type Intents = BitFieldResolvable<GatewayIntentsString, number>

export {
    Intents
}