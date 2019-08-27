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
    color: $(color);
    line-height: 1;
    background: $(color) url('$(logo)');
}
.error {
    color: $(errorColor|#f00);
}
```
Note: without special instructions the following cases all uses this `CSS` template .

### values

- Type: `String`/`Object`
- Default: `null`
- Required: `false`
- Description:  The Object corresponding to the variables in css, used to replace the variable in css，like scss

When the value is `String`, only the file address of type `.js` or `.json` is accepted, otherwise `Object` is accepted as the value.

 ### pattern

- Type: `RegExp`/`String`
- Default: `/\$\(([^()]+)\)/g`
- Required: `false`
- Description: Regular rules for matching variable templates

Used to match custom template expressions in CSS. If there is a capture group, the expression corresponding to `$1` by default, otherwise the whole matching expression is extracted. If there is no capture group, `splitKey` is ignored by default。

```js
// with capture group
postcss([ require('postcss-vars-process')({
    values: {
        'fontSize': '14px',
    	'color': '#333',
    	'logo': './img/logo.png',
        'errorColor': '#f10'
    },
    extract(variables){
        // variables: ['fontSize', 'color', 'logo', 'errorColor|#f00']
        // do something with variables
    }
})])

// without capture group
postcss([ require('postcss-vars-process')({
    pattern: //\$\([^()]+\)/g/,
    values: {
        '$(fontSize)': '14px',
    	'$(color)': '#333',
    	'$(logo)': './logo.png',
    	'$(errorColor|#f00)': '#999'
    },
    extract(variables){
        // variables: ['$(fontSize)', '$(color)', '$(logo)', '$(errorColor|#f00)']
        // do something with variables
    }
})])
```

### logType

- Type: `String:<warn|error>`
- Default: `warn`
- Required: `false`
- Description: Message prompt when variables cannot be  resolved

When a variable cannot be resolved, this specifies whether to throw an error or log a warning. In the case of a warning, the unknow variables will be replaced with an empty string.

### splitKey

- Type: `String`
- Default: `|`
- Required: `false`

All parameters are added directly after the variable via `splitKey`. The number of parameters is not limited.  It is suggested that this attribute be used in conjunction with [extract](#extract), and it is meaningless to use it alone.

For example:

```css
.test{
     border-color: $(color|2|#f00);
}
// extract 'color|2|#f00', then split it with splitKey |
variable: color
valueType: 2 
defaultValue: #f00
```

> The meaning of the parameters is completely defined by you.

### extract

- Type: `Function(Array[])`
- Default: `null`
- Required: `false`

If you need to process the variables, `extract` must be filled in and must be Function.

```js
// with capture group
postcss([ require('postcss-vars-process')({
    extract(variables){
        // variables: ['fontSize', 'color', 'logo', 'errorColor|#f00']
        let vars = {};
        variables.forEach(item => {
			item = item.split('|');
            vars[item[0]] = item[1] : '';
        });
        // export variables
        fs.writeFile(path.join(__dirname, 'vars.json'), JSON.stringify(vars));
    }
})])

// vars.json
{
    "fontSize": "",
    "color": "",
    "logo": "",
    "errorColor": "#f00"
}
```