import fs from 'fs-extra'
import path from 'node:path'
import ts from 'typescript'

// Import JSON files
import pkg from './package.json' with { type: 'json' }
import tsConf from './tsconfig.json' with { type: 'json' }

// Compile TypeScript files
const compileTypeScript = () => {
    const parsedConfig = ts.parseJsonConfigFileContent(tsConf, ts.sys, process.cwd())

    if (parsedConfig.errors.length) {
        console.error('TypeScript configuration errors:')
        parsedConfig.errors.forEach((error) =>
            console.error(
                ts.formatDiagnostic(error, {
                    getCurrentDirectory: ts.sys.getCurrentDirectory,
                    getCanonicalFileName: (name) => name,
                    getNewLine: () => ts.sys.newLine,
                }),
            ),
        )
        process.exit(1)
    }

    // Clear output directory
    if (parsedConfig.options.outDir) {
        fs.rmSync(parsedConfig.options.outDir, { recursive: true, force: true })
    }

    const program = ts.createProgram(parsedConfig.fileNames, parsedConfig.options)
    const emitResult = program.emit()
    const diagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics)

    if (diagnostics.length) {
        console.error('Errors during compilation:')
        diagnostics.forEach(({ file, messageText, start }) => {
            const message = ts.flattenDiagnosticMessageText(messageText, '\n')
            if (file && start !== undefined) {
                const { line, character } = ts.getLineAndCharacterOfPosition(file, start)
                console.error(`${file.fileName} (${line + 1},${character + 1}): ${message}`)
            } else {
                console.error(`Error: ${message}`)
            }
        })
        process.exit(1)
    }
}

// Add license header to JavaScript files
const addLicenseHeader = (dir) => {
    fs.readdirSync(dir).forEach((file) => {
        const filePath = path.join(dir, file)
        if (fs.statSync(filePath).isDirectory()) {
            addLicenseHeader(filePath)
        } else if (filePath.endsWith('.js')) {
            const content = fs.readFileSync(filePath, 'utf-8')
            fs.writeFileSync(filePath, `${licenseHeader}${content}`, 'utf-8')
        }
    })
}

// Copy license file
const copyLicenseFile = (dest) => {
    fs.copyFileSync(path.resolve(pkg.licenseFile), path.join(dest, path.basename(pkg.licenseFile)))
}

// Generate minimal package.json in output directory
const generatePackageJson = (dest) => {
    const minimalPackage = (({ name, license, version, type, author, description, main, dependencies, url }) => ({
        name,
        license,
        version,
        type,
        author,
        description,
        main,
        dependencies,
        url,
    }))(pkg)
    fs.writeFileSync(path.join(dest, 'package.json'), JSON.stringify(minimalPackage, null, 2))
}

// Copy non-TS and non-JS files
const copyAssets = (dest) => {
    fs.cpSync(tsConf.compilerOptions.rootDir, dest, {
        recursive: true,
        filter: (file) => !file.endsWith('.ts') && !file.endsWith('.js'),
    })
}

// License header
const copyright = `Copyright 2025${new Date().getFullYear() > 2025 ? `-${new Date().getFullYear()}` : ''} ${pkg.author}`
const licenseHeader = `/*!\n * @license ${pkg.license}\n * @copyright ${copyright}\n * @author ${pkg.author} - ${pkg.name}\n * @version ${pkg.version}\n * @see ${pkg.licenceURL}\n * @see ${pkg.repository.replace('github:', 'https://github.com/')}\n */\n\n`

// Execute build process
const outputDir = path.resolve(tsConf.compilerOptions.outDir)
compileTypeScript()
addLicenseHeader(outputDir)
copyLicenseFile(outputDir)
generatePackageJson(outputDir)
copyAssets(outputDir)
