#!/usr/bin/env node
const execSync = require('child_process').execSync
const asciiChart = require('asciichart')
const Chartscii = require('chartscii')

let usage = `
\x1b[33m
[ Usage ]
\x1b[0m
	npm-search <npm module search term> [--debug --days <int>]
\x1b[33m
[ Info ]
\x1b[0m
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

// parse package scores
let matches = []
for (i=0; i<resp.results.length; i++) {
	let item = resp.results[i]
	matches[i] = {}
	matches[i]['name'] = item.package.name
	matches[i]['scores'] = [{
			label: "Total",
			value: item.score.final * 1000 | 0
		},
		{
			label: "Search",
			value: item.searchScore * 1000 | 0
		},
		{
			label: "Quality",
			value: item.score.detail.quality * 1000 | 0
		},
		{
			label: "Popularity",
			value: item.score.detail.popularity * 1000 | 0
		},
		{
			label: "Maintenance",
			value: item.score.detail.maintenance * 1000 | 0
		}
	]
	log(matches[i])
}

let allData = []
matches.forEach((package) => {
	// print package scores
	let options = {
	    label: package.name,
	    theme: 'pastel',
	    width: 50,
	    char: '■',
	    sort: true,
	    reverse: true,
	    color: 'blue'
	}
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
	
	let data = []
	for (i=0; i<npmjsResp.downloads.length; i++) {
		data[i] = npmjsResp.downloads[i].downloads
	}
	
	console.log("    \x1b[33mDaily downloads since " + startDate + "\x1b[0m")
	console.log(asciiChart.plot(data, {height: 10}))
	console.log("\n\n")
	allData.push(data)
})

// console.log(asciiChart.plot(allData, {height: 10}))
