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
		'riesky': 'logos/riesky.png',
		'strom': 'logos/strom.svg',
		'siov': 'logos/siov.svg',
		'iuventa': 'logos/iuventa.svg',
		'matfyz': 'logos/matfyz.png',
	}
}

const DATA_URL = 'https://raw.githubusercontent.com/kockatykalendar/data/gh-pages/2020_21.json'
let DATA = []
let FILTER = {
	school: ['zs', 'ss'],
	sciences: ['mat', 'fyz', 'inf', 'other'],
	organizers: ['trojsten', 'p-mat', 'sezam', 'strom', 'riesky', '*'],
	default_organizers: ['trojsten', 'p-mat', 'sezam', 'strom', 'riesky'],
}
const CALENDAR = jsCalendar.new({
	target: '#calendar',
	firstDayOfTheWeek: "2",
	monthFormat: "month YYYY",
	language : "sk"
})

const open_modal = () => {
	document.getElementById("filter-modal").style.display = "block"
}

const close_modal = () => {
	document.getElementById("filter-modal").style.display = "none"
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

		let max_type = ''
		let max_year = ''
		if (event.contestants.max) {
			max_type = event.contestants.max.substr(0, 2)
			max_year = event.contestants.max.substr(2)
		}

		let result = CONSTANTS.contestant_types[min_type] + ' ' + min_year

		if (!event.contestants.max || event.contestants.min == event.contestants.max) {
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
		return date_end <= new Date() ? 'opacity-50 hover:opacity-100 transition-opacity duration-200 ease-in-out' : ''
	},
}

const TEMPLATE = document.getElementById('template-main').innerHTML;
const PARTIAL_TEMPLATE = document.getElementById('template-event-item').innerHTML;
let visible_events = DATA
let is_initial_scroll = false		// used to prevent calendar from hiding during initial scroll

const render = () => {
	let event_list = document.getElementById('event-list')
	event_list.innerHTML = ''

	visible_events = DATA

	// School filter
	visible_events = visible_events.filter((event) => {
		return FILTER.school.indexOf(event.contestants.min.substr(0, 2)) !== -1
			|| !event.contestants.max || FILTER.school.indexOf(event.contestants.max.substr(0, 2)) !== -1
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

		// Ostatni organizatori
		if (FILTER.organizers.indexOf('*') !== -1) {
			if (event.organizers.length === 0) { return true }
			for (let i = event.organizers.length - 1; i >= 0; i--) {
				if (FILTER.default_organizers.indexOf(event.organizers[i]) === -1) {
					return true
				}
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

	visible_events.sort(function(a,b){
		return new Date(a.date.end || a.date.start) - new Date(b.date.end || b.date.start)
	})

	event_list.innerHTML = Mustache.render(TEMPLATE, {data: visible_events}, {partial : PARTIAL_TEMPLATE});

	[...document.getElementsByClassName("js-event-header")].forEach(node => {
		node.addEventListener("click", () => {
			node.parentElement.querySelector(".js-event-description").classList.toggle("hidden")
			node.querySelector(".js-event-icons").classList.toggle("hidden")
		})
	})

	const event = visible_events.find(event =>
		new Date(event.date.end || event.date.start) >= new Date()
	)
	if (event) {
		is_initial_scroll = true
		scroll_to_id(`event-item-${event.id}`)
	}
}

const insert_event = (node, color) => {
	let event_dot = document.createElement("div")
	event_dot.setAttribute("class", "w-2 h-2 rounded-full")
	event_dot.style.backgroundColor = color
	event_dot.style.margin = ".1rem"
	node.appendChild(event_dot)
}

const setup_calendar = () => {

	let rendered = false;

	// Render header
	CALENDAR.onMonthRender(function(index, element, info) {
		document.getElementById("js-calendar-placeholder-month").innerText = element.innerText

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
			filter.addEventListener("click", open_modal)
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
		event_container.style.maxHeight = "20px";
		element.appendChild(event_container)

		// Load from data
		visible_events.forEach(event => {
			// 3 hour
			if (Math.abs(new Date(date.toString('YYYY-MM-DD')).getTime() - new Date(event.date.end || event.date.start).getTime()) <= 60000 * 60 * 3) {
				insert_event(event_container, event.color)
			}
		});
	});

	CALENDAR.onDateClick(function(event, date){
		// Scroll to events around clicked date
		const e = visible_events.find(event =>
			Math.abs(new Date(date.toString('YYYY-MM-DD')).getTime() - new Date(event.date.end || event.date.start).getTime()) <= 60000 * 60 * 3
		)
		if (e) {
			scroll_to_id(`event-item-${e.id}`)
		}
	});
	CALENDAR.refresh()
}

const scroll_to_id = (id) => {
	document.getElementById('scroll').scrollTo({
		top: document.getElementById(id).getBoundingClientRect().top - window.innerHeight / 2 + document.getElementById('scroll').scrollTop,
		left: 0,
		behavior: 'smooth'
	})
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

window.addEventListener("keydown", e => {
	if(!e.isComposing && e.keyCode === 27){
		close_modal()
	}
})


let last_scroll = document.getElementById('scroll').scrollTop
document.getElementById('scroll').addEventListener("scroll", e => {
	let new_scroll = document.getElementById('scroll').scrollTop
	if (is_initial_scroll) {
		last_scroll = new_scroll
		setTimeout(() => {is_initial_scroll = false}, 500)		// smooth scrolling can be still going on
		return
	}

	last_scroll = Math.min(last_scroll, new_scroll)
	if (Math.abs(new_scroll - last_scroll) > 200) {
		document.getElementById("js-calendar-placeholder").classList.remove("hidden")
		document.getElementById("js-calendar-holder").classList.add("hidden")
	}
})


document.getElementById("js-calendar-placeholder-filter").addEventListener("click", open_modal)
document.getElementById("js-calendar-placeholder-open").addEventListener("click", () => {
	document.getElementById("js-calendar-placeholder").classList.add("hidden")
	document.getElementById("js-calendar-holder").classList.remove("hidden")
	last_scroll = document.getElementById('scroll').scrollTop
})
