const CONSTANTS = {
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
	organizers: {
		'trojsten': 'Trojsten',
		'p-mat': 'P-mat',
		'sezam': 'SEZAM',
		'riesky': 'Riešky',
		'strom': 'Strom',
		'siov': 'ŠIOV',
		'iuventa': 'Iuventa',
		'matfyz': 'FMFI UK',
	},
	contestant_types: {
		'zs': 'ZŠ',
		'ss': 'SŠ',
	},
	sciences: {
		'mat': 'MAT',
		'fyz': 'FYZ',
		'inf': 'INF',
		'other': 'iné',
	},
	colors: {
		'red': '#E53E3E',
		'orange': '#ED8936',
		'yellow': '#F6BF26',
		'green': '#7CB342',
		'blue': '#4299E1',
		'purple': '#8E24AA',
	},
	science_color: {
		'mat': 'blue',
		'fyz': 'orange',
		'inf': 'green',
		'other': 'red',
	},
	logo: {
		'trojsten': 'logos/trojsten.svg',
		'p-mat': 'logos/p-mat.svg',
		'sezam': 'logos/sezam.svg',
		'riesky': 'logos/riesky.svg',
		'strom': 'logos/strom.svg',
		'siov': 'logos/siov.svg',
		'iuventa': 'logos/iuventa.svg',
		'matfyz': 'logos/matfyz.png',
	}
}

const DATA_URL = 'https://raw.githubusercontent.com/kockatykalendar/data/gh-pages/2019_20.json'
let DATA = []
let FILTER = {
	school: ['zs', 'ss'],
	sciences: ['mat', 'fyz', 'inf', 'other'],
	organizers: ['trojsten', 'p-mat', 'sezam', 'strom', 'riesky', 'siov'],
}
const CALENDAR = jsCalendar.new({
	target: '#calendar',
	firstDayOfTheWeek: "2",
	monthFormat: "month YYYY",
	language : "sk"
})

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
		CALENDAR.refresh()
	}
}

// Formatting utilities
const fmt = {
	places: function (event) {
		return event.places.join(', ')
	},

	date_verbose: function (event) {
		if (event.date.text) {
			return event.date.text
		}

		let date_start = new Date(event.date.start)
		let result = date_start.getDate() + '. ' + CONSTANTS.months[date_start.getMonth()]

		if (event.date.end) {
			let date_end = new Date(event.date.end)
			result += ' – ' + date_end.getDate() + '. ' + CONSTANTS.months[date_end.getMonth()]
		}

		return result
	},

	type: function (event) {
		return CONSTANTS.types[event.type]
	},

	organizers: function(event) {
		return event.organizers.map((x) => ({'logo': CONSTANTS.logo[x], 'name': CONSTANTS.organizers[x] || x}))

	},

	contestants: function (event) {
		let min_type = event.contestants.min.substr(0, 2)
		let min_year = event.contestants.min.substr(2)
		let max_type = event.contestants.max.substr(0, 2)
		let max_year = event.contestants.max.substr(2)

		let result = CONSTANTS.contestant_types[min_type] + ' ' + min_year

		if (event.contestants.min == event.contestants.max) {
			return result
		}

		result += ' – '

		if (min_type != max_type) {
			result += CONSTANTS.contestant_types[max_type] + ' '
		}

		result += max_year

		return result
	},

	sciences: function (event) {
		return event.sciences.map((x) => CONSTANTS.sciences[x]).join(', ')
	},

	color: function (event) {
		return CONSTANTS.colors?.[event.color] ?? event.color ?? CONSTANTS.colors[CONSTANTS.science_color[event.sciences[0]]]
	},

	background_color: function(event) {
		const date_end = new Date(event.date.end || event.date.start)
		return date_end < new Date() ? 'bg-gray-300' : ''
	},
}

const TEMPLATE = document.getElementById('template-main').innerHTML;
const PARTIAL_TEMPLATE = document.getElementById('template-event-item').innerHTML;
let visible_events = DATA

const render = () => {
	let event_list = document.getElementById('event-list')
	event_list.innerHTML = ''

	visible_events = DATA

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

	// Organizers filter
	visible_events = visible_events.filter((event) => {
		for (let i = FILTER.organizers.length - 1; i >= 0; i--) {
			if (event.organizers.indexOf(FILTER.organizers[i]) !== -1) {
				return true
			}
		}

		return false
	})

	visible_events.forEach((event, index) => {
		event.id = index
		event.color = fmt.color(event)
		event.places = fmt.places(event)
		event.background_color = fmt.background_color(event)
		event.date_verbose = fmt.date_verbose(event)
		event.type = fmt.type(event)
		event.organizers = fmt.organizers(event)
		event.contestants = fmt.contestants(event)
		event.sciences = fmt.sciences(event)
	})

	event_list.innerHTML = Mustache.render(TEMPLATE, {data: visible_events}, {partial : PARTIAL_TEMPLATE});

	[...document.getElementsByClassName("js-event-header")].forEach(node => {
		node.addEventListener("click", () => {
			node.parentElement.querySelector(".js-event-description").classList.toggle("hidden")
			node.querySelector(".js-event-icons").classList.toggle("hidden")
		})
	})

	const currentEventId = `event-item-${visible_events.find(event =>
		new Date(event.date.end || event.date.start) > new Date()
	).id}`
	document.getElementById('scroll').scrollTo({
		top: document.getElementById(currentEventId).getBoundingClientRect().top - 200,
		left: 0,
		behavior: 'smooth'
	})
}

const insert_event = (node, color) => {
	let event_dot = document.createElement("div")
	event_dot.setAttribute("class", "w-2 h-2 rounded-full mr-1 mb-1")
	event_dot.style.backgroundColor = color
	node.appendChild(event_dot)
}

const setup_calendar = () => {

	let rendered = false;

	// Render header
	CALENDAR.onMonthRender(function(index, element, info) {
		if(!rendered) {
			rendered = true;
			let icon = document.createElementNS("http://www.w3.org/2000/svg", "svg")
			icon.setAttribute("viewBox", "0 0 24 24")
			icon.setAttribute("width", "24")
			icon.setAttribute("height", "24")
			icon.setAttribute("fill", "none")
			icon.setAttribute("stroke", "currentColor")
			icon.setAttribute("stroke-width", "2")
			icon.setAttribute("stroke-linecap", "round")
			icon.setAttribute("stroke-linejoin", "round")
			// Setup arrows & filter
			//filter icon
			let filter = icon.cloneNode()
			filter.setAttribute("class", "calendar-filter mx-10 my-8")
			filter.innerHTML = '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>';
			element.parentElement.getElementsByClassName("jsCalendar-title-right")[0].appendChild(filter)
			//right arrow
			let right_arrow = icon.cloneNode()
			right_arrow.innerHTML = '<line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>';
			element.parentElement.getElementsByClassName("jsCalendar-nav-right")[0].appendChild(right_arrow)
			//left arrow
			let left = icon.cloneNode()
			left.innerHTML = '<line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline>';
			element.parentElement.getElementsByClassName("jsCalendar-nav-left")[0].appendChild(left)
		}
	});

	// Render day names ( P U S Š P S N )
	CALENDAR.onDayRender(function(index, element, info) {
		if (index == 0 || index == 6) {
			element.style.color = '#c32525'
		}
	});

	// Render individual days
	CALENDAR.onDateRender(function(date, element, info) {
		if (!info.isCurrent && (date.getDay() == 0 || date.getDay() == 6)) {
			// We could use info.isCurrentMonth but it has bugs (10/2020)
			element.style.color = (CALENDAR._date.getMonth() == date.getMonth()) ? '#c32525' : '#c3252577'
		}

		// Insert event container
		let event_container = document.createElement("div")
		event_container.setAttribute("class", "flex justify-center -mr-1 flex-wrap")
		element.appendChild(event_container)

		// Load from data
		visible_events.forEach(event => {
			let d = event.date.end ? event.date.end : event.date.start
			d = new Date(d.split("-").reverse().join("-"))
			if (d.getTime() === date.getTime()) {
				insert_event(event_container, event.color)
			}
		});
	});

	CALENDAR.onDateClick(function(event, date){
		// TODO: scroll to events around clicked date
		// Test:
		document.getElementById("scroll").scrollTo(0, 5000)
		// maybe add smooth scroll
	});
	CALENDAR.refresh()
}

feather.replace()
load_data()
setup_calendar()

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

	load_data()
})


const open_modal = () => {
	document.getElementById("filter-modal").style.display = 'block'
}

const close_modal = () => {
	document.getElementById("filter-modal").style.display = 'none'
}
