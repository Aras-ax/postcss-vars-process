# PostCSS Vars Process [![Build Status][ci-img]][ci]

[PostCSS] plugin extract and replace variables in the css file like sass/less, support legal custom format variables.

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/moshang-xc/postcss-vars-process.svg
[ci]:      https://travis-ci.org/moshang-xc/postcss-vars-process

```css
.foo {
    /* Input example */
}
```

```css
.foo {
  /* Output example */
}
```

## Usage

```js
postcss([ require('postcss-vars-process') ])
```

See [PostCSS] docs for examples for your environment.
