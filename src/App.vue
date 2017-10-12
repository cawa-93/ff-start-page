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
			let items = new Set()
			let mapIndex = 0
			do {
				this.itemsMap[mapIndex++].forEach(item => items.add(item[1]))
			} while (items.size < this.linkOnPage && mapIndex < this.itemsMap.length)
			return [...items.entries()].slice(0, this.linkOnPage).map((item) => item[0])
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
					const mapIndex = this.getHourDiff(now.getHours(), lastVisitTime.getHours())

					if (!itemsMap[mapIndex]) {
						itemsMap[mapIndex] = new Map()
					}

					if (!itemsMap[mapIndex].has(domain)) {
						itemsMap[mapIndex].set(domain, {data: {url, protocol, domain}, count: 0})
					}

					let {data, count} = itemsMap[mapIndex].get(domain)
					count = count + 1 + item.visitCount/10 + (item.typedCount || 0)/2
					itemsMap[mapIndex].set(domain, {data, count})
				})

			return itemsMap.map(map => (
				[...map.entries()]
					.filter(([,{count}]) => count > 1)
					.sort(([,{count: count1}], [,{count: count2}]) => count2 - count1))
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
		browser.history.search({
			text: '',
			endTime : '2017-10-05',
			startTime: '2017-09-05',
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
