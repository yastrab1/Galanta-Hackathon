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
	},

	color: function () {
		return LANG.colors?.[this.color] ?? this.color ?? LANG.colors[LANG.science_color[this.sciences[0]]]
	}
}

const render = () => {
	const TEMPLATE = document.getElementById('template-event-item').innerHTML
	document.getElementById('event-list').innerHTML = ''

	for (var i = 0; i < DATA.length; i++) {
		let event = DATA[i]
		event['fmt'] = fmt
		if (window.innerWidth > 768) event["open"] = true;
		document.getElementById('event-list').innerHTML += Mustache.render(TEMPLATE, event)
	}

	// render icons
	feather.replace()
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

window.onresize = () => {
	if (window.innerWidth > 768) {
		[...document.getElementsByTagName("details")].forEach(node => {
			node.open = true;
		})
	}
}

