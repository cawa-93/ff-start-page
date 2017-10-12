<template>
<a :href="bookmark.url" class="bookmark" :style="style">
  <div class="sub">{{bookmark.sub}}</div>
  <div class="domain">
    <img ref="icon" height="16" width="16" @load="setMainColor" :src="`https://www.google.com/s2/favicons?domain=${bookmark.url}`" />
    <span>{{bookmark.domain}}</span>
  </div>
  <div class="top">{{bookmark.top}}</div>
</a>
</template>

<script>
export default {
  props: ['bookmark'],
  name: 'bookmark',
  data () {
    let mainColor
    try {
      mainColor = JSON.parse(localStorage.getItem(this.bookmark.url))
    } catch (e) {}
    
    return {
      mainColor: mainColor || [],
      colorBloks: [],
    }
  },
  computed: {
    style() {
      if (this.mainColor.length < 3) {
        return {}
      } else {
        return {
          'background-color': `rgb(${this.mainColor[0]}, ${this.mainColor[1]}, ${this.mainColor[2]})`
        }
      }
    }
  },
  methods: {
    setMainColor () {
      if (!this.$refs.icon || this.mainColor.length) return
      const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
      const image = this.$refs.icon;
      const width = canvas.width = image.width;
      const height = canvas.height = image.height;
      ctx.drawImage(
        image,
        0, 0, width, height,
        0, 0, width, height
      );
      const { data, } = ctx.getImageData(0, 0, width, height);
      const colors = new Map;

      for (let i = 0, l = data.length; i < l; i += 4) {
        if (data[i+3] === 0 || (data[i] > 140 && data[i+1] > 140 && data[i+2] > 140) ) continue

        const color = (data[i] << 16) + (data[i+1] << 8) + data[i+2]; // ignore alpha
        colors.set(color, (colors.get(color) || 0) + 1);
      }

      let maxCount = 0
      let maxColor = null
      colors.forEach((count, color) => {
        if (count > maxCount) maxColor = color
      })
      this.mainColor = [
        maxColor >> 16,
        (maxColor >> 8) & 0xff,
        maxColor & 0xff,
      ]
      localStorage.setItem(this.bookmark.url, JSON.stringify(this.mainColor))
      canvas.remove()
    },
  },
  mounted () {
    const domainContainet = this.$el.querySelector('.domain')
    const domainText = domainContainet.querySelector('span')
    let fontSize = 50
    while (domainContainet.offsetWidth < (domainText.offsetWidth + 47)) {
      domainText.style['font-size'] = `${--fontSize}px`
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.bookmark {
  display: flex;
  flex: 1;
  flex-direction: column;
  margin: 10px;
  min-width: 200px;
  background-color: #000;
  background-image: linear-gradient(135deg, rgba(255,255,255,0.3) 0%,rgba(0,0,0,0.3) 100%);
  color: #fff;
  font-size: 50px;
  text-decoration: none;
  min-height: 150px;
  justify-content: center;
  padding: 0px 20px;
  box-shadow: 0 1px 8px rgba(0,0,0,.2),0 3px 4px rgba(0,0,0,.14),0 3px 3px -2px rgba(0,0,0,.12) !important;
  transition: box-shadow 0.2s, background-color 0.1s;
}
.bookmark:hover {
  box-shadow: 0 7px 8px -4px rgba(0,0,0,.2),0 13px 19px 2px rgba(0,0,0,.14),0 5px 24px 4px rgba(0,0,0,.12) !important;
}

.sub, .top {
  font-size: 30%;
  min-height: 1em;
}
.domain {
  text-align: center;
  display: flex;
  align-items: center;
  word-break: keep-all;
}
.domain > span {
  flex: 1;
  line-height: 59px;
  /*text-transform: uppercase;*/
}
.domain img {
  padding: 8px;
  background: rgb(255,255,255);
  border-radius: 50%;
  margin-right: 15px;
}
.top {
  text-align: right;
}
</style>
