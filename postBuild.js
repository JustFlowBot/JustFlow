import fs from 'fs'
import { join } from 'path'

// Import JSON files
import pkg from './package.json' with { type: 'json' }
import tsConf from './tsconfig.json' with { type: 'json' }

const { outDir, rootDir, declarationDir } = tsConf.compilerOptions

// Remove app/types folder. Since in js is unnecesary
const removeTypesFolder = () => fs.rmSync(join(outDir, 'app', 'types'), { force: true, recursive: true })

// Add license header to JavaScript files
const addLicenseHeader = (out) => {
    fs.readdirSync(out).forEach((file) => {
        const filePath = join(out, file)
        if (fs.statSync(filePath).isDirectory()) {
            addLicenseHeader(filePath)
        } else if (filePath.endsWith('.js') || filePath.endsWith('.ts')) {
            const content = fs.readFileSync(filePath, 'utf-8')
            fs.writeFileSync(filePath, `${licenseHeader}${content}`, 'utf-8')
        }
    })
}

const removeTypingTrash = () => {
    const ignored = {}

    fs.readFileSync('.include', 'utf-8')
        .split('\r\n')
        .forEach((line) => !line.startsWith('#') && (ignored[line] = ''))

    // I will do the refactoring D:
}

// Generate default empty modules folder
const addModulesFolder = () => fs.mkdirSync(join(outDir, 'app', 'modules'), { recursive: true })

// Copy license file
const copyFile = (source, name) => fs.copyFileSync(source, join(outDir, name))

// Generate minimal package.json in output directory
const generatePackageJson = () => {
    const { licenseFile, keywords, devDependencies, licenceURL, scripts, type, typingVersion, ...refinedPackage } = pkg
    fs.writeFileSync(join(outDir, 'package.json'), JSON.stringify(refinedPackage, null, 2)) // build
    refinedPackage['version'] = typingVersion
    refinedPackage['exports'] = {
        '.': './app/types/index.d.ts',
        './utils': './app/utils/index.d.ts',
    }
    delete refinedPackage.main
    delete refinedPackage.workspaces

    fs.writeFileSync(join(declarationDir, 'package.json'), JSON.stringify(refinedPackage, null, 2)) // types
}

// Copy non-TS and non-JS files
const copyAssets = (root = rootDir, out = outDir) => {
    fs.readdirSync(root).forEach((file) => {
        const sourceFilePath = join(root, file)
        const destFilePath = join(out, file)

        if (fs.statSync(sourceFilePath).isDirectory()) {
            !fs.existsSync(destFilePath) && fs.mkdirSync(destFilePath)
            copyAssets(sourceFilePath, destFilePath)
        } else if (!sourceFilePath.endsWith('.ts')) {
            fs.copyFileSync(sourceFilePath, destFilePath)
        }
    })
}

// License header
const copyright = `Copyright 2025${new Date().getFullYear() > 2025 ? `-${new Date().getFullYear()}` : ''} ${pkg.author}`
const licenseHeader = `/*!
 * @license ${pkg.license}
 * @copyright ${copyright}
 * @author ${pkg.author} - ${pkg.name}
 * @version ${pkg.version}
 * @see ${pkg.licenceURL}
 * @see ${pkg.repository.replace('github:', 'https://github.com/')}
 */\n\n`

// Post-Build
copyAssets()
removeTypesFolder()
removeTypingTrash()
addModulesFolder()
copyFile(pkg.licenseFile, 'LICENCE.md')
generatePackageJson()
addLicenseHeader(outDir)
addLicenseHeader(declarationDir)
