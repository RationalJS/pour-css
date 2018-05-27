# pour-css

Pour is a minimalist CSS bundler (~100 LOC). It leaves your CSS files completely alone except for one rule:

    @import (inline) "./my-file.css"

Upon seeing this syntactically-invalid rule, Pour will resolve, read, and inline the contents of that file in place of the rule.

Pour **does not** minify or process your CSS in any way – there are already dedicated tools for that. Pour does one thing and it does it well.

### But why?

You might not need SASS (common installation problems), LESS (poor tooling), or PostCSS (complex setup). CSS has become quite mature out-of-the-box. Did you know browsers now widely support...

- [Actual Variables](https://caniuse.com/#search=css%20variables)?
- [Runtime Calculations](https://developer.mozilla.org/en-US/docs/Web/CSS/calc)?
- [Filters](http://bennettfeely.com/filters/)?
- [Flexbox](https://caniuse.com/#search=flexbox)?
- [Grid Layouts](https://caniuse.com/#search=flexbox)?
- And [all of CSS3](https://caniuse.com/#feat=css-sel3)?

## Usage

```bash
yarn install pour-css
# or
npm install pour-css
```

You can use Pour via the command line or its JavaScript API.

### Command Line Interface (CLI)

```bash
pour my/style.css > bundle.css
```

### JavaScript API

Pour exposes a `bundle` function that takes a file path and returns a stream.

```js
var Pour = require('pour-css');
```

You can pipe to a file...

```js
Pour.bundle(__dirname + '/css/index.css')
    .pipe(fs.createWriteStream('bundle.css'));
```

...or pipe to a HTTP response!

```js
var http = require('http')

http.createServer((req, res) => {
  if ( req.method === 'GET' && req.url === '/style.css' ) {
    Pour.bundle(__dirname + '/css/index.css')
        .pipe(res);
  }
  // ...
});
```

### ReasonML

Coming soon!

## Caveats

If you're mixing `@import` and `@import (inline)`, be careful about how you order them. According to [the official CSS spec](https://www.w3.org/TR/css3-cascade/#at-import), all `@import` rules **must** precede all other rules in your stylesheet. In practice, any `@import` rule that **doesn't** follow the spec is ignored by the browser.

What does this mean for you? Just use these two rules of thumb and you should be good:

1. Don't `@import (inline)` a file that contains normal `@import` statements (or be very careful about it)
2. Put all `@import (inline)` statements **after** your normal `@import` statements (if you have any).

## Testing

If you're adding a feature or fixing a bug, clone this repo down, `npm install`, and use the following to run the test suite:

```
npm test
```
