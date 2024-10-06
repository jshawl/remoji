# remoji

[![npm version](https://badge.fury.io/js/@jshawl%2Fremoji.svg)](https://badge.fury.io/js/@jshawl%2Fremoji)

emoji reactions anywhere! [demo](jshawl.github.io/remoji/)

## Usage

```html
<div data-remoji-id="demo"></div>
<script type="module">
  import { remoji } from "https://www.unpkg.com/@jshawl/remoji@latest/remoji.js";
  remoji.init();
</script>
```

## Configuration

```js
remoji.init({
  apiUrl: "https://my-emoji-reaction-server.com" // default: https://remoji.jshawl.workers.dev
  emojis: ["👍", "👎"], // default: ["👍", "😄", "❤️", "🚀", "👀"]
});
```

## Local Development

Start the client:

```
cd client && npm start
```

Start the server:

```
cd server && npm start
```

Open the development page:

```
open http://127.0.0.1:8080/examples/development.html
```
