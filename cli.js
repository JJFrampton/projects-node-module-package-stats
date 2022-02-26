#!/usr/bin/env node
const execSync = require('child_process').execSync
const asciiChart = require('asciichart')
const Chartscii = require('chartscii')

const black= '\u001b[30m'
const red= '\u001b[31m'
const green= '\u001b[32m'
const yellow= '\u001b[33m'
const blue= '\u001b[34m'
const magenta= '\u001b[35m'
const cyan= '\u001b[36m'
const white= '\u001b[37m'
const reset= '\u001b[0m'
const bright = '\x1b[1m'
const dim = '\x1b[2m'

let usage = `
${yellow}
[ Usage ]
${reset}
	npm-search <npm module search term> [--debug --days <int>]
${yellow}
[ Info ]
${reset}
npm-search module

This module is designed to visually display relevant statistics about
modules you may wish to install.

Currently pulls down a meta score, search score, quality rating,
maintenance rating, popularity rating and a downloads metric

The following sources are used to gather this data:
https://api.npmjs.org
https://api.npms.io
`

const [,, ...args] = process.argv // grab vars after third one

if (!args[0] || args[0].match(/[hH]elp/g)) {console.log(usage); process.exit()}

let parsedArgs = {}
parsedArgs['searchTerm'] = args[0]
args.shift()
while (args.length > 0) {
	if (args[0].match(/^-+/)) {
		let key = args[0].replace(/^-+/g,"")
		let value = true
		if (args[1] && !args[1].match(/^-+/)) { value = args[1]; args.shift() }
		parsedArgs[key] = value
		args.shift()
	}
}

function log(data) {
	if (parsedArgs.debug === true) {console.log(data)}
}

log(parsedArgs.searchTerm)
log(parsedArgs)

let req = `curl -s "https://api.npms.io/v2/search?q=${parsedArgs.searchTerm}"`
let resp = execSync(req)
resp = resp.toString('utf8') // buff to string
resp = JSON.parse(resp)

log(resp)

// parse package scores
let matches = []
for (i=0; i<resp.results.length; i++) {
	let item = resp.results[i]
	matches[i] = {}
	matches[i]['name'] = item.package.name
	let total = item.score.final * 100 | 0
	let searchScore = item.searchScore * 100 | 0
	let quality = item.score.detail.quality * 100 | 0
	let popularity = item.score.detail.popularity * 100 | 0
	let maintenance = item.score.detail.maintenance * 100 | 0
	matches[i]['scores'] = [{
			label: `Total ${total}`,
			value: total
		},
		{
			label: `Search ${searchScore}`,
			value: searchScore
		},
		{
			label: `Quality ${quality}`,
			value: quality
		},
		{
			label: `Popularity ${popularity}`,
			value: popularity
		},
		{
			label: `Maintenance ${maintenance}`,
			value: maintenance
		}
	]
	log(matches[i])
}

let allData = []
matches.forEach((package) => {
	// print package scores
	let options = {
	    label: 'Percentage Scores',
	    theme: 'pastel',
	    width: 50,
	    // char: '■',
	    sort: true,
	    // reverse: true,
	    color: `${bright}${magenta}`
	}
	console.log()
	let titleSeparator = new Array(66 + 1).join('=')
	console.log(`${yellow}${titleSeparator}${reset}`)
	console.log(`${yellow}${package.name.toUpperCase()}${reset}`)
	console.log(`${yellow}${titleSeparator}${reset}`)
	const chart = new Chartscii(package.scores, options)
	console.log(chart.create(), package.name)

	// get and print historical downloads
	let date = new Date(Date.now())
	let y = date.getFullYear()
	let m = date.getMonth()
	let d = date.getDate()

	let days = parsedArgs.days || 50
	days = days * 24 * 60 * 60 * 1000
	let newDate = new Date(Date.now() - days)
	let ny = newDate.getFullYear()
	let nm = newDate.getMonth()
	let nd = newDate.getDate()

	m += 1
	nm += 1

	let startDate = `${ny}-${nm}-${nd}`
	let endDate = `${y}-${m}-${d}`
	log("start date : " + startDate)
	log("end date : " + endDate)
	let npmjsReq = `curl -s https://api.npmjs.org/downloads/range/${startDate}:${endDate}/${package.name}`
	
	npmjsResp = execSync(npmjsReq)
	npmjsResp = npmjsResp.toString('utf8') // buff to string
	npmjsResp = JSON.parse(npmjsResp)

	log(npmjsResp)
	
	let total = 0
	let modeCount = {}
	let maxIndex = 0
	let data = npmjsResp.downloads.map((entry) => {
		let dls = entry.downloads
		total += dls
		if (modeCount[dls]) {
			modeCount[dls] +=1
			if (modeCount[dls] > maxIndex) { maxIndex = modeCount[dls] }
		} else {
			modeCount[dls] = 1
		}
		return dls
	})
	data = data.sort((a, b) => { return a - b })
	let mean = Math.round(total / data.length)
	let ln = data.length
	let median
	if (ln % 2 === 0) { // even
		median = (data[ln / 2 - 1] + data[ln / 2]) / 2; // take average of both
	} else { // odd
		median = data[(ln - 1) / 2]
	}
	let mode = []
	for (const [key, value] of Object.entries(modeCount)) {
		if (value === maxIndex) { mode.push(key) }
	}
	let range = data[ln-1] - data[0]
	
	console.log(`${bright}${magenta}Downloads from ${startDate} to ${endDate}${reset}`)
	console.log(`       Mean ${red}${mean}${reset}`)
	console.log(`     Median ${red}${median}${reset}`)
	console.log(`       Mode ${red}${mode.length > 0 ? mode : "NA"}${reset}`)
	console.log(`      Range ${red}${range}${reset}`)
	console.log(`  Downloads :`)
	console.log(asciiChart.plot(data, {height: 10}))
	console.log("\n\n")
	allData.push(data)
})

// console.log(asciiChart.plot(allData, {height: 10}))
