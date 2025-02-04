import { join, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

export const toDir = (path: string) => join(dirname(fileURLToPath(import.meta.url)), '..', ...path.split('/'))
export const toFile = (path: string) => pathToFileURL(toDir(path)).toString()
