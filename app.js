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
		'other': 'iné',
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
		'nucem': 'NÚCEM',
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
		'matfyz': 'logos/matfyz.svg',
		'fykos': 'logos/fykos.svg',
		'nucem': 'logos/nucem.svg',
	},
	school_years: [
		'Mladší',
		'ZŠ 1', 'ZŠ 2', 'ZŠ 3', 'ZŠ 4', 'ZŠ 5', 'ZŠ 6', 'ZŠ 7', 'ZŠ 8', 'ZŠ 9',
		'SŠ 1', 'SŠ 2', 'SŠ 3', 'SŠ 4',
		'Starší'
	]
}

const DATA_URL = 'https://data.kockatykalendar.sk/2021_22.json'
let DATA = []
let FILTER = {
	school: [0, 14],
	sciences: ['mat', 'fyz', 'inf', 'other'],
	organizers: ['trojsten', 'p-mat', 'sezam', 'strom', 'riesky', '*'],
	default_organizers: ['trojsten', 'p-mat', 'sezam', 'strom', 'riesky'],
}
const CALENDAR = jsCalendar.new({
	target: '#calendar',
	firstDayOfTheWeek: '2',
	monthFormat: 'month YYYY',
	language : 'sk'
})

const open_modal = () => {
	document.getElementById('filter-modal').style.display = 'block'
}

const close_modal = () => {
	document.getElementById('filter-modal').style.display = 'none'
}

const open_search = () => {
	const anim = document.getElementById('search-modal').animate(
		[{transform: "translateY(5rem)"}],
		{ duration: 200, fill: 'both', easing: 'ease' },
	);
	anim.addEventListener('finish', () => {
		anim.commitStyles();
		anim.cancel();
	});
	let search_input = document.getElementById('search-input');
	search_input.focus();
	search_input.value = localStorage.getItem('search');
	render();
	CALENDAR.refresh();
}

const close_search = () => {
	const anim = document.getElementById('search-modal').animate(
		[{transform: "translateY(0)"}],
		{ duration: 200, fill: 'both', easing: 'ease' },
	);
	anim.addEventListener('finish', () => {
		anim.commitStyles();
		anim.cancel();
	});
	let search_input = document.getElementById('search-input');
	localStorage.setItem('search', search_input.value);
	document.getElementById('mobile-search-input').value = "";
	search_input.value = "";
	render();
	CALENDAR.refresh();
}

const sorting_key = (event) => {
	if (event.date.end) {
		return Math.min(
			new Date(event.date.end),
			Math.max(new Date(event.date.start), new Date())
		)
	}

	return new Date(event.date.start)
}

const school_to_int = (school, max) => {
	return (parseInt(school?.slice(-1), 10) + (school?.substr(0,2) === 'ss')*9) || max*14;
}

const load_data = () => {
	let xhr = new XMLHttpRequest()
	xhr.open('GET', DATA_URL)
	xhr.responseType = 'json'
	xhr.send()

	xhr.onload = function() {
		DATA = xhr.response

		DATA.forEach((event, index) => {
			for (const key in fmt) {
				if (fmt.hasOwnProperty(key)) {
					event[key] = fmt[key](event)
				}
			}
		})

		DATA.sort((a, b) => {
			if (a.is_active && b.is_active) {
				return new Date(a.date.start) - new Date(b.date.start)
			}
			return sorting_key(a) - sorting_key(b)
		})

		render()
		CALENDAR.refresh()
	}
}

// Formatting utilities
const fmt_contestant = (contestant, prev_contestant) => {
	if (prev_contestant && prev_contestant.substr(0, 2) === contestant.substr(0, 2)) {
		return contestant.substr(2)
	}

	return CONSTANTS.contestant_types[contestant.substr(0, 2)] + ' ' + contestant.substr(2)
}

const fmt = {
	pretty_places: function (event) {
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

	pretty_type: function (event) {
		return CONSTANTS.types[event.type]
	},

	pretty_organizers: function(event) {
		return event.organizers.map((x) => ({'logo': CONSTANTS.logo[x], 'name': CONSTANTS.organizers[x] || x}))
	},

	pretty_contestants: function (event) {
		if (!event.contestants.min && !event.contestants.max) {
			return 'ktokoľvek'
		}

		if (!event.contestants.min && event.contestants.max) {
			return fmt_contestant(event.contestants.max) + ' a mladší'
		}

		if (event.contestants.min && !event.contestants.max) {
			return fmt_contestant(event.contestants.min) + ' a starší'
		}

		if (event.contestants.min == event.contestants.max) {
			return fmt_contestant(event.contestants.min)
		}

		return fmt_contestant(event.contestants.min) + ' – ' + fmt_contestant(event.contestants.max, event.contestants.min)
	},

	pretty_sciences: function (event) {
		return event.sciences.map((x) => CONSTANTS.sciences[x]).join(', ')
	},

	color: function (event) {
		return CONSTANTS.colors?.[event.color] ?? event.color ?? CONSTANTS.colors[CONSTANTS.science_color[event.sciences[0]]]
	},

	background_color: function(event) {
		const date_end = new Date(event.date.end || event.date.start).getTime() + 86400000
		return date_end <= new Date().getTime() ? 'opacity-50 hover:opacity-100 transition-opacity duration-200 ease-in-out' : ''
	},

	is_active: function (event) {
		if (event.cancelled) {
			return false
		}

		if (event.date.end) {
			return new Date(event.date.start).getTime() <= new Date().getTime() && new Date().getTime() < new Date(event.date.end).getTime() + 86400000
		}

		return new Date(event.date.start).getTime() <= new Date().getTime() && new Date().getTime() < new Date(event.date.start).getTime() + 86400000
	}
}

const TEMPLATE = document.getElementById('template-main').innerHTML;
const PARTIAL_TEMPLATE = document.getElementById('template-event-item').innerHTML;
let visible_events = DATA
let is_initial_scroll = false		// used to prevent calendar from hiding during initial scroll
let first_id = 0
let last_id = 0

const render = () => {
	let event_list = document.getElementById('event-list')
	event_list.innerHTML = ''

	visible_events = DATA

	// School filter
	visible_events = visible_events.filter((event) => {
		return Math.max(FILTER.school[0], FILTER.school[1]) >= school_to_int(event.contestants.min, 0) && Math.min(FILTER.school[0], FILTER.school[1]) <= school_to_int(event.contestants.max, 1);
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

	//filter search
	visible_events = visible_events.filter(x => JSON.stringify(x).includes(document.getElementById('search-input').value))
	//filter search mobile
	visible_events = visible_events.filter(x => JSON.stringify(x).includes(document.getElementById('mobile-search-input').value))

	visible_events.forEach((event, index) => {
		event.id = index
	})

	const event = visible_events.find(event =>
		new Date(event.date.end || event.date.start) >= new Date()
	) ?? visible_events[visible_events.length - 1]
	
	first_id = Math.max(parseInt(event?.id, 10) - 10, 0)
	last_id = Math.min(parseInt(event?.id, 10) + 20, visible_events.length)

	event_list.innerHTML = Mustache.render(TEMPLATE, {data: visible_events.slice(first_id, last_id)}, {partial : PARTIAL_TEMPLATE});

	[...document.getElementsByClassName("js-event-header")].forEach(node => {
		node.addEventListener("click", () => {
			node.parentElement.querySelector(".js-event-description").classList.toggle("hidden")
			node.querySelector(".js-event-icons").classList.toggle("hidden")
		})
	})

	if (event) {
		is_initial_scroll = true
		scroll_to_id(`event-item-${event.id}`)
	}
}

const insert_event = (node, color) => {
	let event_dot = document.createElement('div')
	event_dot.setAttribute('class', 'w-2 h-2 rounded-full')
	event_dot.style.backgroundColor = color
	event_dot.style.margin = '.1rem'
	node.appendChild(event_dot)
}

const setup_calendar = () => {

	let rendered = false;

	// Render header
	CALENDAR.onMonthRender(function(index, element, info) {
		document.getElementById('js-calendar-placeholder-month').innerText = element.innerText

		if(!rendered) {
			rendered = true;
			let icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
			icon.setAttribute('viewBox', '0 0 24 24')
			icon.setAttribute('width', '24')
			icon.setAttribute('height', '24')
			icon.setAttribute('fill', 'none')
			icon.setAttribute('stroke', 'currentColor')
			icon.setAttribute('stroke-width', '2')
			icon.setAttribute('stroke-linecap', 'round')
			icon.setAttribute('stroke-linejoin', 'round')
			// Setup arrows & filter
			//filter icon
			let filter = icon.cloneNode()
			filter.setAttribute('class', 'md:hidden')
			filter.setAttribute('style', 'margin: 10px 8px;')	// We can't use tailwind, because .jsCalendar * sets everything to 0 and takes precedence.
			filter.innerHTML = '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>'
			filter.addEventListener('click', open_modal)
			element.parentElement.getElementsByClassName('jsCalendar-title-right')[0].appendChild(filter)
			//right arrow
			let right_arrow = icon.cloneNode()
			right_arrow.innerHTML = '<line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>';
			element.parentElement.getElementsByClassName('jsCalendar-nav-right')[0].appendChild(right_arrow)
			//left arrow
			let left = icon.cloneNode()
			left.innerHTML = '<line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline>';
			element.parentElement.getElementsByClassName('jsCalendar-nav-left')[0].appendChild(left)
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
		let event_container = document.createElement('div')
		event_container.setAttribute('class', 'flex justify-center flex-wrap')
		event_container.style.maxHeight = '20px';
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
	document.getElementById(id).animate([{
		'backgroundColor': 'rgb(254, 235, 200)',
		'boxShadow': 'inset 0 0 0 3px rgb(237, 137, 54)',
		offset: 0.5
		}], {
		duration: 1500,
		easing: 'cubic-bezier(.25, .75, .75, .25)',
		iterations: 2
	});
	document.getElementById('scroll').scrollTo({
		top: document.getElementById(id).getBoundingClientRect().top - window.innerHeight / 2 + document.getElementById('scroll').scrollTop,
		left: 0,
		behavior: 'smooth'
	})
}

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

	render()
	CALENDAR.refresh()
})

window.addEventListener('keydown', e => {
	if(!e.isComposing && e.keyCode === 27){
		close_modal();
		close_search();
	}
	if (e.keyCode === 114 || ((e.ctrlKey || e.metaKey) && e.keyCode === 70)) { 
		e.preventDefault();
		open_search();
	}
})

let search_timer = 0;
document.querySelectorAll('[type=search]').forEach( parent => {
	parent.addEventListener('input', e => {
		clearTimeout(search_timer);
		search_timer = setTimeout(() => {
			render();
			CALENDAR.refresh();
		}, 300);
	})
})

let last_scroll = document.getElementById('scroll').scrollTop
document.getElementById('scroll').addEventListener('scroll', e => {
	const { scrollTop, scrollHeight, clientHeight } = document.getElementById('scroll')

	if (is_initial_scroll) {
		last_scroll = scrollTop
		setTimeout(() => {
			is_initial_scroll = false		// smooth scrolling can be still going on
			setInterval(() => {
				let scroll = document.getElementById('scroll')
				if(scroll.scrollTop == 0) scroll.scroll(0,2)
			}, 100)
		}, 500)
		return
	}

	last_scroll = Math.min(last_scroll, scrollTop)
	if (Math.abs(scrollTop - last_scroll) > 200) {
		document.getElementById('js-calendar-placeholder').classList.remove('hidden')
		document.getElementById('js-calendar-holder').classList.add('hidden')
	}
	
	let event_list = document.getElementById('event-list')
	
	if(clientHeight + scrollTop >= scrollHeight - 100) {
		
		let old_last_id = last_id;
		last_id = Math.min(last_id + 3, visible_events.length)
		event_list.insertAdjacentHTML('beforeend', Mustache.render(TEMPLATE, {data: visible_events.slice(old_last_id, last_id)}, {partial : PARTIAL_TEMPLATE}));
	}
	
	if(scrollTop < 100) {
		let event_list = document.getElementById('event-list')
		let old_first_id = first_id;
		first_id = Math.max(first_id - 3, 0)
		event_list.insertAdjacentHTML('afterbegin', Mustache.render(TEMPLATE, {data: visible_events.slice(first_id, old_first_id)}, {partial : PARTIAL_TEMPLATE}));
	}
})


document.getElementById('js-calendar-placeholder-filter').addEventListener('click', open_modal)
document.getElementById('js-calendar-placeholder-open').addEventListener('click', () => {
	document.getElementById('js-calendar-placeholder').classList.add('hidden')
	document.getElementById('js-calendar-holder').classList.remove('hidden')
	last_scroll = document.getElementById('scroll').scrollTop
})


let switched = false;

document.querySelectorAll('.double-slider').forEach(parent => {
	parent.addEventListener('focusin', e => {
		if(e.target.className == 'va') {
			parent.classList.toggle('switched');
		}
	}, false);
	parent.addEventListener('focusout', e => {
		if(e.target.className == 'va') {
			parent.classList.toggle('switched');
		}
	}, false);
	parent.addEventListener('input', e => {
		document.querySelectorAll(`.${e.target.className}`).forEach( el => {
			el.parentNode.style.setProperty(`--${e.target.className}`, +e.target.value);
			el.value = e.target.value;
			el.nextElementSibling.firstElementChild.innerHTML = CONSTANTS.school_years[e.target.value];
		});
		
		if((parseInt(document.getElementById('v1').value) < parseInt(document.getElementById('v0').value)) && !switched) {
			e.target.parentNode.classList.toggle('switched');
			switched = true;
		} else if ((parseInt(document.getElementById('v1').value) > parseInt(document.getElementById('v0').value)) && switched) {
			e.target.parentNode.classList.toggle('switched');
			switched = false;
		}

		if (e.target.className == 'va') FILTER.school[0] = e.target.value;
		else FILTER.school[1] = e.target.value;
		
		render()
		CALENDAR.refresh()
	}, false);
});
