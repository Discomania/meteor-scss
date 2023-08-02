// import url from 'url'
// import path from 'path'

export function convertToStandardPath(osPath) {
  if (process.platform === 'win32') {
    // Sometimes, you can have a path like \Users\IEUser on windows, and this
    // actually means you want C:\Users\IEUser
    if (osPath[0] === '\\') {
      osPath = process.env.SystemDrive + osPath
    }

    /* osPath = osPath.replace(/\\/g, '/')
    if (osPath[1] === ':') {
      // transform "C:/bla/bla" to "/c/bla/bla"
      osPath = `/${osPath[0].toLowerCase()}${osPath.slice(2)}`
    } */

	// transform "C:/bla/bla" to "/C:/bla/bla"
	// osPath = osPath.replace(/\\/g, '/')
	// osPath = osPath.replace(/^([a-zA-Z]{1}:)/, "/$1")

	osPath = osPath.replace(/\//g, '\\')
	osPath = osPath.replace(/\\{1,2}/g, '\\')

  }
  
  return osPath
}
