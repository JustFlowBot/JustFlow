import { styleText } from 'node:util'
import { readFileSync } from 'fs'
import { toDir } from './file.js'
import { parse } from 'yaml'
import { JustConfig } from '../types/config.js'

const { debug: configDebug } = parse(readFileSync(toDir('config/justFlow.yml'), 'utf8')) as JustConfig

const now = () => {
    const now = new Date()

    return (
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ` +
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    )
}

const colors = {
    LOG: 'yellow',
    DEBUG: 'magentaBright',
    ERROR: 'red',
} as const

const format = (level: keyof typeof colors, message: any) => {
    return styleText(
        colors[level],
        `[${styleText('bold', level)}] [${styleText('dim', level === 'LOG' ? now().split(' ')[1] : now())}] ${message}`,
    )
}

const log = (message: any) => {
    console.info(format('LOG', message))
}

const debug = (message: any) => {
    if (configDebug) console.debug(format('DEBUG', message))
}

const error = (message: any) => {
    console.error(format('ERROR', message))
}

export { log, debug, error }
