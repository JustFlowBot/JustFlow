import fs from 'fs'
import path from 'path'

// Import JSON files
import pkg from './package.json' with { type: 'json' }
import tsConf from './tsconfig.json' with { type: 'json' }

const { outDir, rootDir } = tsConf.compilerOptions

// Remove app/types folder. Since in js is unnecesary
const removeTypesFolder = () => fs.rmSync(path.join(outDir, 'app', 'types'), { force: true, recursive: true })

// Add license header to JavaScript files
const addLicenseHeader = (out = outDir) => {
    fs.readdirSync(out).forEach((file) => {
        const filePath = path.join(out, file)
        if (fs.statSync(filePath).isDirectory()) {
            addLicenseHeader(filePath)
        } else if (filePath.endsWith('.js')) {
            const content = fs.readFileSync(filePath, 'utf-8')
            fs.writeFileSync(filePath, `${licenseHeader}${content}`, 'utf-8')
        }
    })
}

// Generate default empty modules folder
const addModulesFolder = () => {
    fs.mkdirSync(path.join(outDir, 'app', 'modules'))
}

// Copy license file
const copyFile = (source, name) => {
    fs.copyFileSync(source, path.join(outDir, name))
}

// Generate minimal package.json in output directory
const generatePackageJson = () => {
    const { licenseFile, keywords, devDependencies, licenceURL, scripts, type, ...refinedPackage } = pkg

    fs.writeFileSync(path.join(outDir, 'package.json'), JSON.stringify(refinedPackage, null, 2))
}

// Copy non-TS and non-JS files
const copyAssets = (root = rootDir, out = outDir) => {
    fs.readdirSync(root).forEach((file) => {
        const sourceFilePath = path.join(root, file)
        const destFilePath = path.join(out, file)

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
addLicenseHeader()
addModulesFolder()
copyFile(pkg.licenseFile, 'LICENCE.md')
generatePackageJson()
