import { convertToStandardPath } from './convert-to-standard-path'
import { decodePath, encodePath } from './replace-package-paths'
import { fixTilde } from './fix-tilde'
import { getRealImportPath } from './get-real-import-path'
import { getRealImportPathFromIncludes } from './get-real-import-path-from-includes'
import { decodeFilePath } from './decode-file-path'

import path from 'path'
import fs from 'fs'

//Handle import statements found by the sass compiler, used to handle cross-package imports
export const createImporter = ({
	rootDir,
	allFiles,
	inputFile,
	referencedImportPaths,
	sourceMapPaths,
}) => {
	const parentMap = new Map()
	const totalImportPath = []

	return (url, prev) => {
		prev = decodePath(prev)
		prev = fixTilde(prev)
		prev = convertToStandardPath(prev)

		if (prev !== undefined) {
			// iterate backwards over totalImportPath and remove paths that don't equal the prev url
			for (let i = totalImportPath.length - 1; i >= 0; i--) {
				// check if importPath contains prev, if it doesn't, remove it. Up until we find a path that does contain it
				if (totalImportPath[i] === prev) {
					break
				} else {
					// remove last item (which has to be item i because we are iterating backwards)
					totalImportPath.splice(i, 1)
				}
			}
		}

		if (!totalImportPath.length) {
			totalImportPath.push(prev)
		}

		let importPath = decodePath(url)
		importPath = fixTilde(importPath)
		importPath = convertToStandardPath(importPath)

		// prepend previous dirname to relative path
		for (let i = totalImportPath.length - 1; i >= 0; i--) {
			if (path.isAbsolute(importPath) || importPath.startsWith('{')) {
				break
			}
			// 'path' is the nodejs path module
			importPath = path.join(path.dirname(totalImportPath[i]), importPath)
		}

		// remove everything before {
		let accPosition = importPath.lastIndexOf('{')
		if (accPosition > 0) {
			importPath = importPath.substr(accPosition, importPath.length)
		}

		const _getRealImportPath = getRealImportPath(
			inputFile,
			totalImportPath,
			allFiles,
			rootDir,
		)

		try {
			let parsed = _getRealImportPath(importPath)

			if (!parsed) {
				parsed = getRealImportPathFromIncludes(
					decodePath(url),
					_getRealImportPath,
				)
			}

			if (parsed) parentMap.set(parsed.path, prev)

			if (!parsed) {
				//Nothing found...
				throw new Error(`File to import: ${url} not found in file: ${prev}`)
			}

			totalImportPath.push(parsed.path)

			if (parsed.absolute) {
				sourceMapPaths.push(parsed.path)
				return {
					contents: fs.readFileSync(parsed.path, 'utf8'),
					// file: encodePath(parsed.path),
					file: parsed.path,
				}
			} else {
				referencedImportPaths.push(parsed.path)
				sourceMapPaths.push(decodeFilePath(parsed.path))
				return {
					contents: allFiles.get(parsed.path).getContentsAsString(),
					file: encodePath(parsed.path),
				}
			}
		} catch (e) {
			return e
		}
	}
}
