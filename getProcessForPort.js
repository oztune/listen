// Source: https://github.com/facebookincubator/create-react-app/blob/dc4ce606ef8b4c97aec0c80c20f8116e9795bb21/packages/react-dev-utils/getProcessForPort.js

'use strict'

var execSync = require('child_process').execSync
var path = require('path')

var execOptions = {
	encoding: 'utf8',
	stdio: [
		'pipe', // stdin (default)
		'pipe', // stdout (default)
		'ignore' //stderr
	]
}

function getProcessIdOnPort(port) {
	return execSync('lsof -i:' + port + ' -P -t -sTCP:LISTEN', execOptions)
		.split('\n')[0]
		.trim()
}

function getPackageNameInDirectory(directory) {
	var packagePath = path.join(directory.trim(), 'package.json')

	try {
		return require(packagePath).name
	} catch (e) {
		return null
	}
}

function getProcessCommand(processId, processDirectory) {
	var command = execSync(
		'ps -o command -p ' + processId + ' | sed -n 2p',
		execOptions
	)
	
	const packageName = getPackageNameInDirectory(processDirectory)
	return packageName ? packageName : command
}

function getDirectoryOfProcessById(processId) {
	return execSync(
		'lsof -p ' + processId + ' | awk \'$4=="cwd" {print $9}\'',
		execOptions
	).trim()
}

module.exports = function getProcessForPort(port) {
	try {
		var processId = getProcessIdOnPort(port)
		var directory = getDirectoryOfProcessById(processId)
		var command = getProcessCommand(processId, directory)

		return { command, directory	}
	} catch (e) {
		return null
	}
}