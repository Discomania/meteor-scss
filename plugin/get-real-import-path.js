import { fileExists } from './file-exists'
import { addUnderscore } from './add-underscore'
import { hasUnderscore } from './has-underscore'
import path from 'path'

export const getRealImportPath =
	(inputFile, totalImportPath, allFiles, rootDir) => importPath => {

		// TODO: This fix works.. BUT if you edit the scss/css file it doesn't recompile! Probably because of the absolute path problem
		if (importPath.startsWith('{')) {
			// replace {}/node_modules/ for rootDir + "node_modules/"
			importPath = importPath.replace(
				/^(\{\}(\/|\\)node_modules(\/|\\))/,
				rootDir + 'node_modules' + path.sep
			)

			// replace {}/ for rootDir 
			importPath = importPath.replace(
				/^(\{\}(\/|\\))/,
				rootDir
			)

			/* if (importPath.endsWith('.css')) {
				// .css files aren't in allFiles. Replace {}/ for absolute path.
				importPath = importPath.replace(/^(\{\}(\/|\\))/, rootDir)
			} */
		}

		const isAbsolute = path.isAbsolute(importPath)

		//SASS has a whole range of possible import files from one import statement, try each of them
		const possibleFiles = []

		//If the referenced file has no extension, try possible extensions, starting with extension of the parent file.
		let possibleExtensions = ['scss', 'sass', 'css']

		if (!importPath.match(/\.s?(a|c)ss$/)) {
			possibleExtensions = [
				inputFile.getExtension(),
				...possibleExtensions.filter(e => e !== inputFile.getExtension()),
			]
			for (const extension of possibleExtensions) {
				possibleFiles.push(`${importPath}.${extension}`)
			}
		} else {
			possibleFiles.push(importPath)
		}

		//Try files prefixed with underscore
		for (const possibleFile of possibleFiles) {
			if (!hasUnderscore(possibleFile)) {
				possibleFiles.push(addUnderscore(possibleFile))
			}
		}

		//Try if one of the possible files exists
		for (const possibleFile of possibleFiles) {
			if (
				(isAbsolute && fileExists(possibleFile)) ||
				(!isAbsolute && allFiles.has(possibleFile))
			) {
				return { absolute: isAbsolute, path: possibleFile }
			}
		}
		//Nothing found...
		return null
	}
