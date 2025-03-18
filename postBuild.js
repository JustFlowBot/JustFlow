import fs from 'fs'
import { join, sep } from 'path'

import pkg from './package.json' with { type: 'json' }
import tsConf from './tsconfig.json' with { type: 'json' }

const { outDir, rootDir, declarationDir } = tsConf.compilerOptions

const loadCleanFile = () => {
    const getMode = (line) => {
        const regex = /^\[([+-])(?:\/([^/\]]+\/[^/\]]+)\/)?\]/
        return line.match(regex)
    }

    let relPath
    let action
    const filter = {}

    fs.readFileSync('.cleanup', 'utf-8')
        .split(/\r\n|\r|\n/)
        .forEach((line) => {
            if (line.trim() === '') return
            if (line.startsWith('[')) {
                const match = getMode(line)
                if (!match) return
                ;[, action, relPath] = match
                relPath = join(relPath)
                filter[relPath] = { action, files: new Set() }
            } else {
                const filePath = join(relPath, line)
                if (action === '-') {
                    filter[relPath].files.add(filePath)
                } else if (action === '+') {
                    filter[relPath].files.add(filePath)
                    if (fs.statSync(filePath).isDirectory())
                        for (const dir of fs.readdirSync(filePath, { recursive: true })) {
                            filter[relPath].files.add(join(filePath, dir))
                        }
                    const d = filePath.split('\\')
                    for (let i = 2; i < d.length - 1; i++) {
                        filter[relPath].files.add(join(...d.slice(0, i + 1)))
                    }
                }
            }
        })
    return (filePath) => {
        const [_key1, _key2] = filePath.split(sep)
        const relPath = join(_key1, _key2)
        const fk = filter[relPath]
        if (!fk) return false

        if (fk.action === '-' && fk.files.has(filePath)) {
            fs.rmSync(filePath, { force: true, recursive: true })
            return true
        } else if (fk.action === '+' && !fk.files.has(filePath)) {
            fs.rmSync(filePath, { force: true, recursive: true })
            return true
        }
    }
}

const checkDeletion = loadCleanFile()

// Add license header to JavaScript files
const setLicenseHeader = (path, version) => {
    const copyright = `Copyright 2025${new Date().getFullYear() > 2025 ? `-${new Date().getFullYear()}` : ''} ${pkg.author}`
    const licenseHeader = `/*!
    * @license ${pkg.license}
    * @copyright ${copyright}
    * @author ${pkg.author} - ${pkg.name}
    * @version ${version}
    * @see ${pkg.licenceURL}
    * @see ${pkg.repository.replace('github:', 'https://github.com/')}
    */\n\n`

    if (path.endsWith('.js') || path.endsWith('.ts')) {
        const content = fs.readFileSync(path, 'utf-8')
        fs.writeFileSync(path, `${licenseHeader}${content}`, 'utf-8')
    }
}
const appStuff = (root = outDir) => {
    // Copy sources
    for (const _file of fs.readdirSync(rootDir, { recursive: true })) {
        const sfp = join(rootDir, _file)
        const dfp = join(root, _file)

        if (!fs.statSync(sfp).isDirectory() && !sfp.endsWith('.ts') && !sfp.endsWith('.js')) {
            fs.cpSync(sfp, dfp, { recursive: true })
        }
    }

    // Remove trash files and apply licence header to files
    for (const _file of fs.readdirSync(root, { recursive: true })) {
        const file = join(root, _file)

        if (checkDeletion(file) || !fs.existsSync(file)) continue
        !fs.statSync(file).isDirectory() && setLicenseHeader(file, pkg.version)
    }

    // Make a neccesary package.json
    const { licenseFile, keywords, devDependencies, licenceURL, scripts, type, typingVersion, ...refinedPackage } = pkg
    fs.writeFileSync(join(root, 'package.json'), JSON.stringify(refinedPackage, null, 2))

    // Make a default empty modules folder
    fs.mkdirSync(join(root, 'app', 'modules'), { recursive: true })

    // Copy license file
    fs.cpSync(licenseFile, join(root, 'LICENCE.MD'))
}

const typeStuff = (root = declarationDir) => {
    // Remove trash files and apply licence header to files
    for (const _file of fs.readdirSync(root, { recursive: true })) {
        const file = join(root, _file)

        if (checkDeletion(file) || !fs.existsSync(file)) continue
        !fs.statSync(file).isDirectory() && setLicenseHeader(file, pkg.version)
    }

    // Make a neccesary package.json
    const {
        licenseFile,
        keywords,
        devDependencies,
        licenceURL,
        scripts,
        type,
        typingVersion,
        main,
        workspaces,
        ...refinedPackage
    } = pkg
    refinedPackage['version'] = typingVersion
    refinedPackage['exports'] = {
        '.': './app/types/index.d.ts',
        './utils': './app/utils/index.d.ts',
    }

    fs.writeFileSync(join(root, 'package.json'), JSON.stringify(refinedPackage, null, 2))

    // Copy license file
    fs.cpSync(licenseFile, join(root, 'LICENCE.MD'))
}

appStuff()
typeStuff()
