import { readdirSync } from 'fs'
import { toDir, toFile } from '../utils/file.js'
import type { loadedModules, Module } from '../types/modules.js'
import type { Entity } from '../types/typeORM.js'

const loadModule = async (file: string): Promise<Module> => {
    const modulePath = toFile(`modules/${file}/mod.js`)
    const { default: module } = await import(modulePath)
    return module as Module
}

const processEntities = (entity: Entity, moduleFile: string): Entity => {
    if (typeof entity !== 'string') return entity
    return toDir(`modules/${moduleFile}/${entity}`)
}

const processModule = ({ data, ...moduleData }: Module, file: string, result: loadedModules): void => {
    if (data?.dbEntities) {
        const entities = Array.isArray(data.dbEntities) ? data.dbEntities : Object.values(data.dbEntities)

        entities.forEach((entity) => result.dbEntities.push(processEntities(entity, file)))
    }

    if (data?.discordIntents) {
        result.discordIntents.push(data.discordIntents)
    }

    result.modules.push(moduleData)
}

export default (async function () {
    const result: loadedModules = {
        discordIntents: [],
        dbEntities: [],
        modules: [],
    }

    console.log('executed!')
    const moduleFiles = readdirSync(toDir('modules'))

    await Promise.all(
        moduleFiles.map(async (file) => {
            const mod = await loadModule(file)
            processModule(mod, file, result)
        }),
    )

    return result
})()
