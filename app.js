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
	},
	sciences_short: {
		'mat': 'M',
		'fyz': 'F',
		'inf': 'I',
		'other': 'iné',
	}
}

const DROPDOWN_CLASSES = {
	on: ['bg-blue-500', 'text-white'],
	off: ['text-black', 'hover:bg-blue-500', 'hover:text-white'],
}

const DATA_URL = 'https://raw.githubusercontent.com/kockatykalendar/data/master/build/2019_20.json'
let DATA = []
let FILTER = {
	school: false,
	sciences: [],
}

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

		list_render()
	}
}

// Formatting utilities
const fmt = {
	places: function () {
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

const list_render = () => {
	const TEMPLATE = document.getElementById('template-event-item').innerHTML
	document.getElementById('event-list').innerHTML = ''

	let visible_events = DATA

	// School filter
	if (FILTER.school) {
		visible_events = visible_events.filter((event) => {
			return (event.contestants.min.substr(0, 2) == FILTER.school || event.contestants.max.substr(0, 2) == FILTER.school)
		})
	}

	// Sciences filter
	if (FILTER.sciences.length != 0) {
		visible_events = visible_events.filter((event) => {
			for (var i = FILTER.sciences.length - 1; i >= 0; i--) {
				if (event.sciences.indexOf(FILTER.sciences[i]) === -1) {
					return false
				}
			}

			return true
		})
	}

	for (var i = 0; i < visible_events.length; i++) {
		let event = visible_events[i]
		event['fmt'] = fmt
		document.getElementById('event-list').innerHTML += Mustache.render(TEMPLATE, event)
	}

	// render icons
	feather.replace()
}

feather.replace()
load_data()

// FILTERS
const dropdown_onclick = (e) => {
	let menu = e.currentTarget.parentElement.querySelector('.js-dropdown-menu')

	if (menu.classList.contains('hidden')) {
		dropdown_hide()
		menu.classList.remove('hidden')
	} else {
		menu.classList.add('hidden')
	}
}
document.querySelectorAll('.js-dropdown-button').forEach((elem) => elem.onclick = dropdown_onclick)

const dropdown_hide = () => {
	document.querySelectorAll('.js-dropdown-menu').forEach((elem) => elem.classList.add('hidden'))
}

const dropdown_set_active = (elem, active) => {
	if (active) {
		DROPDOWN_CLASSES.off.forEach((cls) => elem.classList.remove(cls))
		DROPDOWN_CLASSES.on.forEach((cls) => elem.classList.add(cls))
	} else {
		DROPDOWN_CLASSES.on.forEach((cls) => elem.classList.remove(cls))
		DROPDOWN_CLASSES.off.forEach((cls) => elem.classList.add(cls))
	}
}

document.getElementById('dropdown-school').querySelectorAll('li').forEach((elem) => elem.onclick = (event) => {
	let school = event.target.dataset.school

	if (FILTER.school == school) {
		dropdown_set_active(event.target, false)
		FILTER.school = false
	} else {
		document.querySelectorAll('#dropdown-school li').forEach((elem) => dropdown_set_active(elem, false))
		dropdown_set_active(event.target, true)
		FILTER.school = school
	}

	dropdown_hide()
	document.querySelector('#dropdown-school .js-dropdown-button span').innerHTML = LANG.contestant_types[FILTER.school] || "(všetky školy)"
	list_render()
})

document.getElementById('dropdown-sciences').querySelectorAll('li').forEach((elem) => elem.onclick = (event) => {
	let science = event.target.dataset.science

	if (FILTER.sciences.indexOf(science) !== -1) {
		dropdown_set_active(event.target, false)
		FILTER.sciences = FILTER.sciences.filter((x) => x != science)
	} else {
		dropdown_set_active(event.target, true)
		FILTER.sciences.push(science)
	}

	dropdown_hide()

	let display = ''
	if (FILTER.sciences.length == 0) {
		display = '(všetky vedy)'
	} else if (FILTER.sciences.length == 1) {
		display = LANG.sciences[FILTER.sciences[0]]
	} else {
		display = FILTER.sciences.map((x) => LANG.sciences_short[x]).join(', ')
	}

 	document.querySelector('#dropdown-sciences .js-dropdown-button span').innerHTML = display
 	list_render()
})
