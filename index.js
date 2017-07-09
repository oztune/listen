/** eslint-disable no-console */

// This is meant to be generic and can be refactored elsewhere.

/**
Features:
- Logs the local address and network address to visit the site.
- When port is in use, shows info about the process using it.
 */

const http = require('http')
const chalk = require('chalk')
const getProcessForPort = require('./getProcessForPort')

const _DEV_ = process.env.NODE_ENV !== 'production'

module.exports = function (app) {
	var argPort = process.argv[2]
	if (argPort !== undefined && isNaN(parseFloat(argPort))) {
		console.warn(`Incorrect 'port' argument passed: '${ argPort }'. Please specify a number or nothing to use the default (env.PORT || 3000).`) //eslint-disable-line no-console
		argPort = null
	}

	const port = argPort || process.env.PORT || 3000

	const server = http.createServer(app)
	server.on('error', error => {
		if (error.code === 'EADDRINUSE') {
			if (_DEV_) {
				const info = getProcessForPort(error.port)
				console.error(`\n${ chalk.bgRed.white('ERROR') } ${ chalk.reset(`Port ${ port } is already is use by ${ chalk.cyan(info.command) }`) }`)
				console.error(`  ${ chalk.bold('in') } ${ chalk.reset(info.directory) }`)
			} else {
				console.error('Port already in use', error.port)
			}

			process.exit(1)
		} else {
			throw error
		}
	})
	server.listen(port, function () {
		if (_DEV_) {
			// TODO: Show more info
			const packageName = getProjectName()
			const networkIp = getNetworkIp()

			// console.log(`\nServer started. You can visit ${ chalk.bold(packageName) } in the browser.\n`)
			// console.log(`  ${ chalk.bold('Local') }:           http://localhost:${ port }`)
			// console.log(`  ${ chalk.bold('On your network') }: http://${ networkIp }:${ port }`)
			// console.log()

			// console.log(chalk.bold(`Web server started. You can visit ${ chalk.bold(packageName) } in the browser.`))
			console.log(chalk.bold('Web server started.'), `You can visit ${ chalk.bold(packageName) } in the browser:`)
			// console.log()
			console.log(`  ${ chalk.cyan.underline(`http://localhost:${ port }`) }`)
			console.log(`  ${ chalk.cyan.underline(`http://${ networkIp }:${ port }`) }`)
			console.log()

			// TODO: Put this back in the right place. Probably in the same place that
			// says that the bundle compiled.
			//
			// console.log('Note that the development build is not optimized.')
			// console.log(`To create a production build use ${ chalk.magenta('npm run build') }.`)
			// console.log()
		} else {
			console.log('Server started listening on port ' + port)
		}
	})
}

const os = require('os')

// Stolen and changed without understanding how it really works from: https://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js
function getNetworkIp () {
	const ifaces = os.networkInterfaces()
	for (let ifname in ifaces) {
		for (let iface of ifaces[ifname]) {
			if ('IPv4' !== iface.family || iface.internal !== false) {
				// skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
				continue
			}

			return iface.address
		}
	}
}

function getProjectName () {
	try {
		return require(process.cwd() + '/package.json').name
	} catch (e) {
		return 'Project name'
	}
}