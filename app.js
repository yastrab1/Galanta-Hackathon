const LANG = {
	months: [
		'jan', 'feb', 'mar', 'apr', 'máj', 'jún', 'júl', 'aug', 'sept', 'okt', 'nov', 'dec'
	],
	types: {
		'sutaz': 'súťaž',
		'seminar': 'seminár',
		'sustredenie': 'sústredenie',
		'vikendovka': 'víkendovka',
		'tabor': 'tábor',
		'olympiada': 'olympiáda',
		'prednasky': 'prednášky',
	},
	contestant_types: {
		'zs': 'ZŠ',
		'ss': 'SŠ',
	},
	sciences: {
		'mat': 'matematika',
		'fyz': 'fyzika',
		'inf': 'informatika',
		'other': 'iné',
	}
}

const DATA_URL = 'https://raw.githubusercontent.com/kockatykalendar/data/master/build/2019_20.json'
let DATA = []

const load_data = () => {
	let xhr = new XMLHttpRequest()
	xhr.open('GET', DATA_URL)
	xhr.responseType = 'json'
	xhr.send()

	xhr.onload = function() {
		DATA = xhr.response
		DATA.sort((a, b) => {
			return new Date(a.date.start) - new Date(b.date.start)
		})

		render()
	}
}

// Formatting utilities
const fmt = {
	places: function () {
		console.log(this)
		return this.places.join(', ')
	},

	date: function () {
		if (this.date.text) {
			return this.date.text
		}

		let date_start = new Date(this.date.start)
		let result = date_start.getDate() + '. ' + LANG.months[date_start.getMonth()]

		if (this.date.end) {
			let date_end = new Date(this.date.end)
			result += ' – ' + date_end.getDate() + '. ' + LANG.months[date_end.getMonth()]
		}

		return result
	},

	type: function () {
		return LANG.types[this.type]
	},

	contestants: function () {
		let min_type = this.contestants.min.substr(0, 2)
		let min_year = this.contestants.min.substr(2)
		let max_type = this.contestants.max.substr(0, 2)
		let max_year = this.contestants.max.substr(2)

		let result = LANG.contestant_types[min_type] + ' ' + min_year

		if (this.contestants.min == this.contestants.max) {
			return result
		}

		result += ' – '

		if (min_type != max_type) {
			result += LANG.contestant_types[max_type] + ' '
		}

		result += max_year

		return result
	},

	sciences: function () {
		return this.sciences.map((x) => LANG.sciences[x]).join(', ')
	}
}

const render = () => {
	const TEMPLATE = document.getElementById('template-event-item').innerHTML
	document.getElementById('event-list').innerHTML = ''

	for (var i = 0; i < DATA.length; i++) {
		let event = DATA[i]
		event['fmt'] = fmt
		document.getElementById('event-list').innerHTML += Mustache.render(TEMPLATE, event)
	}

	// render icons
	feather.replace()
}

feather.replace()
load_data()
