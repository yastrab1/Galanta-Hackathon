const load_json = async url => {
	const response = await fetch(url)
	if (response.ok) {
		const jsonValue = await response.json()
		return Promise.resolve(jsonValue)
	} else {
		return []
	}
}

const DEFAULT_ORGANIZERS = ['trojsten', 'p-mat', 'riesky', 'sezam', 'strom']
const DATA_URL_PREFIX = 'https://data.kockatykalendar.sk/'

let ORGANIZERS = load_json(`${DATA_URL_PREFIX}organizers.json`)



document.addEventListener('DOMContentLoaded', async () => {
	ORGANIZERS = await ORGANIZERS
	const orgs_html = DEFAULT_ORGANIZERS.reduce((html, org) => `${html}
<article class="border rounded-lg p-8 text-center shadow" style="border-color: ${ORGANIZERS[org].color}">
	<a href="${ORGANIZERS[org].web}" target="_blank" rel="noreferrer">
		<img src="${DATA_URL_PREFIX}${ORGANIZERS[org].icon}" alt="${ORGANIZERS[org].name}" class="h-24 mx-auto mb-4">
	</a>
	<h2 class="mb-2 font-bold text-2xl">${ORGANIZERS[org].name}</h2>
		<p>${ORGANIZERS[org].info}</p>
</article>`, '')
	document.getElementById('organizations').innerHTML = orgs_html
})
