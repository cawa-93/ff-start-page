<template>
	<div id="app">
		<bookmark v-for="(bookmark, i) in bookmarks" :bookmark="bookmark" :key="i"/>
	</div>
</template>

<script>
import topDomains from './domain-list.js'
import bookmark from './components/bookmark.vue'
export default {
	name: 'app',
	components: {bookmark},
	data () {
		return {
			history: null,
			linkOnPage: 16,
		}
	},
	computed: {
		bookmarks() {
			// this.items.map(console.log)
			return this.items.map(({data: site}) => {
				const bookmark = {
					url: site.url,
					sub: [],
					domain: '',
					top: []
				}
				if (/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+(:[0-9]+)?/.test(site.domain)) {
					bookmark.domain = site.domain
				} else {
					const components = site.domain.split('.')
					while (components.length) {
						const comp = components.pop()
						if (topDomains.has(comp.toUpperCase())) {
							bookmark.top.unshift(comp)
						} else {
							bookmark.domain = comp
							bookmark.sub = components
							break
						}
					}
				}
				if (!bookmark.domain) {
					bookmark.domain = bookmark.top.shift()
				}
				bookmark.sub = bookmark.sub.join('.')
				bookmark.top = bookmark.top.join('.')
				return bookmark
			})
		},
		items () {
			if (!this.itemsMap.length) return []
			let items = new Map()
			for (var i = 0; i < this.itemsMap.length; i++) {
				if (!this.itemsMap[i]) continue

				for (var d = 0; d < this.itemsMap[i].length; d++) {
					if (!this.itemsMap[i][d]) continue

					if (items.size < this.linkOnPage) {
						items.set(this.itemsMap[i][d][0], this.itemsMap[i][d][1])
					} else {
						return [...items.entries()].map(set => set[1])
					}
				}
			}

			return [...items.entries()].map(set => set[0])
		},
		itemsMap() {
			if (!this.history) return []
			const itemsMap = []
			this.history
				.filter(item => /^http/.test(item.url))
				.forEach(item => {
					const [url, protocol, domain] = item.url.match(/(https?):\/\/(?:www\.)?([^/]+)/)
					const lastVisitTime = new Date(item.lastVisitTime)
					const now = new Date()

					if (now.getDay() !== lastVisitTime.getDay()) {
						return
					}

					const mapIndex = this.getHourDiff(now.getHours(), lastVisitTime.getHours())

					if (!itemsMap[mapIndex]) {
						itemsMap[mapIndex] = new Map()
					}

					if (!itemsMap[mapIndex].has(domain)) {
						itemsMap[mapIndex].set(domain, {data: {url, protocol, domain}, rating: 0, visitCount: 0})
					}

					let {data, rating, visitCount} = itemsMap[mapIndex].get(domain)
					rating = rating + 1 + item.visitCount/10 + (item.typedCount || 0)/2 + 30 / ((now - lastVisitTime)/86400000)
					itemsMap[mapIndex].set(domain, {data, rating, visitCount: ++visitCount})
				})

			return itemsMap.map(map => (
				[...map.entries()]
					.filter(([,{visitCount}]) => visitCount > 1)
					.sort(([,{rating: rating1}], [,{rating: rating2}]) => rating2 - rating1))
			)
		}
	},
	methods: {
		getHourDiff (a, b) {
			let res = Math.abs(a-b)
			if (res > 12) {
				res = 24 - res
			}
			return res
		}
	},
	mounted() {
		const now = new Date()
		browser.history.search({
			text: '',
			endTime : now, // Now
			startTime: now - 86400000*30, // 30 days ago
			maxResults: 999999999999 // all items
		}).then(h => {
			this.history = h
		})
	}
}
</script>

<style>
body, html {
	margin: 0;
	padding: 0;
}
#app {
	display: flex;
	flex-wrap: wrap;
	font-family: "Trebuchet MS", Helvetica, sans-serif;
	/*background: #323232;*/
	padding: 10px;
}

</style>
