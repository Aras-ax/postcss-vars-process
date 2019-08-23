var postcss = require('postcss')

var plugin = require('../lib/')

function run(input, output, opts) {
    return postcss([plugin(opts)]).process(input).then(function(result) {
        expect(result.css).toEqual(output)
        expect(result.warnings()).toHaveLength(0)
    })
}

/* Write tests here

it('does something', function () {
  return run('a{ }', 'a{ }', { })
})

*/

function text() {
    let outArr = [];
    let input = `.a{
          font-size: 12px;
          color: $(main-color);
          background: url("$(bg)");
        }
        input{
          font-size: $(fontSize);
          color: $(color);
          background: $(main-color);
        }
        `,
        values = {
            'main-color': '#f00',
            bg: './img/data.png',
            fontSize: '14px',
            color: '#aaa'
        },
        outPut = `.a{
        font-size: 12px;
        color: #f00;
        background: url("./img/data.png");
      }
      input{
        font-size: 14px;
        color: #aaa;
        background: #f00;
      }
      `,
        opts = {
            extract(arr) {
                outArr = outArr.concat(arr);
            },
            values: './test/data.js'
        };
    postcss([plugin(opts)]).process(input).then(function(result) {
        console.log(outArr);
        console.log(result.css);
    });
}

text();

// 提取变量的正确性
// 错误处理的正确性
// values未处理项的正确性
// value替换的正确性
// pattern 正确性
// split验证
// 参数添加空格

let css = `.a{
  font-size: 12px;
  color: $(color|3);
  background: url("$(bg)");
}`,
    outCss = `.a{
  font-size: 12px;
  color: #f00;
  background: url("./test.jpg");
}`,
    cssVals = {
        color: '#f00',
        bg: './test.jpg'
    };

let input = `.a{
    font-size: 12px;
    color: $(main-color);
    background: url("$(bg)");
  }
  input{
    font-size: $(fontSize);
    color: $(color);
    background: $(main-color);
  }
  `,
    values = {
        'main-color': '#f00',
        bg: './img/data.png',
        fontSize: '14px',
        color: '#aaa'
    },
    outPut = `.a{
  font-size: 12px;
  color: #f00;
  background: url("./img/data.png");
}
input{
  font-size: 14px;
  color: #aaa;
  background: #f00;
}
`;

describe('postcss-vars-process', () => {
    it('使用默认参数', () => {
        check(input, outPut, {
            values
        });
    });

    // 值不全
    it('option is empty', () => {
        check(input, outPut);
    });

    // 有错

    describe('plugin options', () => {
        describe('split', () => {
            it('set split to &', () => {
                check(`.a{
                        font-size: 12px;
                        color: $(color&3);
                        background: url("$(bg)");
                      }`, outCss, {
                    values: cssVals
                });
            });
        });

        describe('pattern', () => {
            it('set pattern to /\@\<([^()]+)\>/g', () => {
                check(`.a{
            font-size: 12px;
            color: @<color&3>;
            background: url("@<bg>");
          }`, outCss, {
                    values: cssVals
                });
            });
        });

        describe('extract', () => {
            it('set extract to string', () => {
                checkExtract(input, outPut, {
                    values
                }, []);
            });
        });

        describe('values', () => {

            it('values is plain object', () => {
                check(input, outPut, {
                    values: {}
                });
            });

            it('use .json', () => {
                check(input, outPut, {
                    values: './test/data.json'
                });
            });

            it('use .js', () => {
                check(input, outPut, {
                    values: './test/data.js'
                });
            });
            it('use not exist data file', () => {
                check(input, outPut, {
                    values: './test/none.js'
                });
            });
            it('use Object literal', () => {
                check(input, outPut, {
                    values
                });
            });
        });
    });

    function check(input, output, opts) {
        // const processor = postcss().use(plugin(options));
        // // if (expected instanceof RegExp) {
        // //     expect(() => {
        // //         return processor.process(stripTabs(actual)).css;
        // //     }).toThrow(expected);
        // //     return;
        // // }
        // expect(
        //     processor.process(stripTabs(actual)).css
        // ).toEqual(
        //     stripTabs(expected)
        // );

        postcss([plugin(opts)]).process(input).then(function(result) {
            expect(result.css).toEqual(output);
        })
    }

    function checkExtract(input, output, opts, outArrs) {
        let vars = [];
        opts.extract = function(arr) {
            vars = vars.concat(arr);
        }
        postcss([plugin(opts)]).process(input).then(function(result) {
            expect(result.css).toEqual(output);
            expect(vars).toEqual(outArrs);
        })
    }

    function stripTabs(input) {
        return input.replace(/\t/g, '');
    }

});