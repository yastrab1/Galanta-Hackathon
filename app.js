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
}

const DATA_URL = 'https://raw.githubusercontent.com/kockatykalendar/data/master/build/2019_20.json'
let DATA = []
let FILTER = {
	school: ['zs', 'ss'],
	sciences: ['mat', 'fyz', 'inf', 'other'],
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
	visible_events = visible_events.filter((event) => {
		return (FILTER.school.indexOf(event.contestants.min.substr(0, 2)) !== -1 || FILTER.school.indexOf(event.contestants.max.substr(0, 2)) !== -1)
	})

	// Sciences filter
	visible_events = visible_events.filter((event) => {
		for (let i = FILTER.sciences.length - 1; i >= 0; i--) {
			if (event.sciences.indexOf(FILTER.sciences[i]) !== -1) {
				return true
			}
		}

		return false
	})

	for (let i = 0; i < visible_events.length; i++) {
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
const filter_update_checked = () => {
	document.querySelectorAll('.js-filter-checkbox').forEach((elem) => {
		if (FILTER[elem.dataset.filter].indexOf(elem.value) !== -1) {
			elem.checked = true
		} else {
			elem.checked = false
		}
	})
}
filter_update_checked()

document.querySelectorAll('.js-filter-checkbox').forEach((elem) => elem.onchange = (event) => {
	const filter_type = event.currentTarget.dataset.filter
	const value = event.currentTarget.value
	const checked = event.currentTarget.checked

	if (checked && FILTER[filter_type].indexOf(value) === -1) {
		FILTER[filter_type].push(value)
		filter_update_checked()
	}

	if (!checked && FILTER[filter_type].indexOf(value) !== -1) {
		FILTER[filter_type] = FILTER[filter_type].filter((x) => x != value)
		filter_update_checked()
	}
})


const open_modal = () => {
	document.getElementById("filter-modal").style.display = 'block'
}

const close_modal = () => {
	document.getElementById("filter-modal").style.display = 'none'
	load_data()
}
