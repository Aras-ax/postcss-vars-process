# PostCSS Vars Process [![Build Status][ci-img]][ci]

[PostCSS] plugin to extract and replace variables in the css file, support legal custom format variables. Extract variables to Json file for secondary development or other use, and replace variables based on the given value.

## this plugin is under development

```js
// 参数设定
option: {
  isExtract: true, // true: extract variables out, false: Replace variables based on the given value
  outPath: '', // if extract is true, then this property is in need
  values: '' // path or object, if extract is fasle ,then this property is in need
}
```

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


https://dockyard.com/blog/2018/02/01/writing-your-first-postcss-plugin
