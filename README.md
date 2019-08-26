# PostCSS Vars Process [![Build Status][ci-img]][ci]

[PostCSS] plugin to extract and replace variables in the css file, support legal custom format variables. Extract variables array for secondary development or other use, and replace variables based on the given value.

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/moshang-xc/postcss-vars-process.svg
[ci]:      https://travis-ci.org/moshang-xc/postcss-vars-process

input
```css
.foo {
    font-size: $(size);
    color: $(color);
}
```

```js
// variable.js
module.exports = {
    size: '12px',
    color: '#fff'
}
postcss([ require('postcss-vars-process')({
    values: './variable.js'
})])
```

output

```css
.foo {
    font-size: 12px;
    color: #fff;
}
```

```js
// extract variables
['size', 'color']
```

## Usage

```js
postcss([ require('postcss-vars-process')(options) ])
```

See [PostCSS] docs for examples for your environment.

## Installation
```js
npm install postcss-vars-process
```

## options

```css
.text {
    font-size: $(fontSize);
    color: $(color|1);
    line-height: 1;
    background: $(color) url('$(logo)');
}
.error {
    color: $(errorColor|2);
}
```

说明：后面的示例如果没有特别说明都使用该`css`模板

 ### pattern

- Type: `RegExp`/`String`

- Default: `/\$\(([^()]+)\)/g`
- Required: `false`

用于匹配`CSS`中的自定义表达式，如果有捕获组，默认提取$1对应的表达式，否则提取整个匹配的表达式

```js

```



### logType

- Type: `String:<warn|error>`

- Default: `warn`
- Required: `false`

When a variable cannot be resolved, this specifies whether to throw an error or log a warning. In the case of a warning, the unknow variable will be replaced with an empty string.

### splitKey

- Type: `String`

- Default: `|`
- Required: `false`

所有的变量都可以附带参数，参数个数不限制，参数和变量通过`splitKey`连接，建议该属性与`extract`配合使用，单独使用无意义。

### extract

- Type: `Function(Array[])`
- Default: `null`

- Required: `false`

如果需要处理提取的变量，则为必填，且必须是`Function`，否则无法操作变量。