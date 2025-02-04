import { Intents } from './discord.js'
import { Client } from 'discord.js'
import { Entity, MixedList } from './typeORM.js'

interface Module {
    data?: ModuleData
    onLoad: (client: Client) => void
    onDisable?: () => void
}

interface ModuleData {
    dbEntities: MixedList<Entity>
    discordIntents: Intents
}

interface loadedModules {
    discordIntents: Intents[]
    dbEntities: Entity[]
    modules: Omit<Module, 'data'>[]
}

export {
    Module,
    ModuleData,
    loadedModules
}