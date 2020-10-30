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
	}
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

		render()
	}
}

// Formatting utilities
const fmt = {
	places: function (event) {
		return event.places.join(', ')
	},

	date: function (event) {
		if (event.date.text) {
			return event.date.text
		}

		let date_start = new Date(event.date.start)
		let result = date_start.getDate() + '. ' + LANG.months[date_start.getMonth()]

		if (event.date.end) {
			let date_end = new Date(event.date.end)
			result += ' – ' + date_end.getDate() + '. ' + LANG.months[date_end.getMonth()]
		}

		return result
	},

	type: function (event) {
		return LANG.types[event.type]
	},

	contestants: function (event) {
		let min_type = event.contestants.min.substr(0, 2)
		let min_year = event.contestants.min.substr(2)
		let max_type = event.contestants.max.substr(0, 2)
		let max_year = event.contestants.max.substr(2)

		let result = LANG.contestant_types[min_type] + ' ' + min_year

		if (event.contestants.min == event.contestants.max) {
			return result
		}

		result += ' – '

		if (min_type != max_type) {
			result += LANG.contestant_types[max_type] + ' '
		}

		result += max_year

		return result
	},

	sciences: function (event) {
		return event.sciences.map((x) => LANG.sciences[x]).join(', ')
	},

	color: function (event) {
		return LANG.colors?.[event.color] ?? event.color ?? LANG.colors[LANG.science_color[event.sciences[0]]]
	}
}

const TEMPLATE = document.getElementById('template-main').innerHTML;
const PARTIAL_TEMPLATE = document.getElementById('template-event-item').innerHTML;

const render = () => {
	let event_list = document.getElementById('event-list')
	event_list.innerHTML = ''

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

	visible_events.forEach(event => {
		event.color = fmt.color(event)
		event.places = fmt.places(event)
		event.date = fmt.date(event)
		event.type = fmt.type(event)
		event.contestants = fmt.contestants(event)
		event.sciences = fmt.sciences(event)
	})

	event_list.innerHTML = Mustache.render(TEMPLATE, {data: visible_events}, {partial : PARTIAL_TEMPLATE});

	[...document.getElementsByClassName("event-header")].forEach(node => {
		node.addEventListener("click", () => {
			node.parentElement.classList.toggle("close")
		})
	})

}

const insert_event = (node, color) => {
	var event_dot = document.createElement("div")
	event_dot.setAttribute("class", `w-2 h-2 ${color} rounded-full mr-1 mb-1`)
	node.appendChild(event_dot)
}

const setup_calendar = () => {

	var calendar = jsCalendar.new({
		target: '#calendar',
		firstDayOfTheWeek: "2",
		monthFormat: "month YYYY",
		language : "sk"
	});

	// Render header
	calendar.onMonthRender(function(index, element, info) {
		// Setup arrows & filter
		var right =  document.createElement("div")
		right.setAttribute("class", "flex flex-1 justify-end")
		var filter = document.createElement("i")
		filter.setAttribute("data-feather", "filter")
		filter.setAttribute("class", "mr-2 md:hidden")
		filter.setAttribute("style", "margin-left: -24;")
		right.appendChild(filter)
		var right_arrow = document.createElement("i")
		right_arrow.setAttribute("data-feather", "arrow-right")
		right.appendChild(right_arrow)
		element.parentElement.getElementsByClassName("jsCalendar-nav-right")[0].appendChild(right)

		var left = document.createElement("i")
		left.setAttribute("data-feather", "arrow-left")
		element.parentElement.getElementsByClassName("jsCalendar-nav-left")[0].appendChild(left)
	});

	// Render day names ( P U S Š P S N )
	calendar.onDayRender(function(index, element, info) {
		if (index == 0 || index == 6) {
			element.style.color = '#c32525'
		}
	});

	// Render individual days
	calendar.onDateRender(function(date, element, info) {
		if (!info.isCurrent && (date.getDay() == 0 || date.getDay() == 6)) {
			element.style.color = (info.isCurrentMonth) ? '#c32525' : '#c3252577'
		}

		// Insert event container
		var event_container = document.createElement("div")
		event_container.setAttribute("class", "flex justify-center -mr-1 flex-wrap")
		element.appendChild(event_container)

		// TODO: Load from data
		// Example:
		var event_dates = [
			jsCalendar.tools.stringToDate("15-10-2020"),
			jsCalendar.tools.stringToDate("18-10-2020")
		]

		event_dates.forEach(event_date => {
			if (event_date.getTime() === date.getTime()) {
				insert_event(event_container, "bg-red-600")
				insert_event(event_container, "bg-gray-500")
			}
		});
	});

	calendar.onDateClick(function(event, date){
		// TODO: scroll to events around clicked date
		// Test:
		document.getElementById("scroll").scrollTo(0, 5000)
		// maybe add smooth scroll
	});

	// Refresh layout
	calendar.refresh()
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
})


const open_modal = () => {
	document.getElementById("filter-modal").style.display = 'block'
}

const close_modal = () => {
	document.getElementById("filter-modal").style.display = 'none'
	load_data()
}
