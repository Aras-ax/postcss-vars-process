var postcss = require('postcss')

var plugin = require('../lib/')

const { loadFile } = require('../lib/util');

let outCss = `.a{
  font-size: 12px;
  color: #f00;
  background: url("./test.jpg");
}`;

let input = `.a{
        font-size: 12px;
        color: $(main-color);
        background: $(color) url("$(bg)");
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
        background: #aaa url("./img/data.png");
      }
    input{
        font-size: 14px;
        color: #aaa;
        background: #f00;
    }
    `;


// const processor = postcss().use(plugin({
//     values
// }));
// processor.process(input).then(data => {
//     console.log(1);
// });
// return;

describe('postcss-vars-process', () => {
    it('basic demo use', () => {
        check(input, outPut, {
            values
        });
    });

    it('warning when option is empty', () => {
        checkWarning(input, null, 5);
    });

    // 工具函数的验证
    describe('util loadFile', () => {
        it('load .js file', () => {
            expect(loadFile('./test/data.js')).toEqual(values);
        });
        it('load .json file', () => {
            expect(loadFile('./test/data.js')).toEqual(values);
        });

        it('load .md file', () => {
            expect(new Promise(function() {
                loadFile('./README.md')
            })).rejects.toThrow(/File type must be \.js or \.json/);
        });

        it('load un exist file', () => {
            expect(new Promise(function() {
                loadFile('./test/none.js')
            })).rejects.toThrow(/Unhandled option file:/);
        });
    });

    describe('plugin options', () => {
        describe('splitKey', () => {
            it('set splitKey to &', () => {
                check(`.a{
                        font-size: 12px;
                        color: $(color&3);
                        background: url("$(bg)");
                      }`, outCss, {
                    splitKey: '&',
                    values: {
                        color: '#f00',
                        bg: './test.jpg'
                    }
                });
            });
        });

        describe('pattern', () => {
            it('with Capturing groups: /\@\<([^<>]+)\>/g', () => {
                check(`.a{
                        font-size: 12px;
                        color: @<color|3>;
                        background: url("@<bg>");
                      }`,
                    outCss, {
                        pattern: /\@\<([^<>]+)\>/g,
                        values: {
                            color: '#f00',
                            bg: './test.jpg'
                        }
                    });
            });

            it('without Capturing groups: extract the full expression matched', () => {
                checkExtract(`.a{
                    font-size: 12px;
                    color: $color|3;
                    background: url("$bg");
                  }`,
                    outCss, {
                        pattern: /\$[^;"\s]+/g,
                        values: {
                            '$color|3': '#f00',
                            $bg: './test.jpg'
                        }
                    }, ['$color|3', '$bg']);
            });
        });

        describe('extract', () => {
            it('string: extract empty when extract is not function', () => {
                checkExtract(input, outPut, {
                    values,
                    extract: ''
                }, []);
            });

            it('function: extract the first capturing group array of the pattern', () => {
                checkExtract(input, outPut, {
                    values
                }, ["main-color", "color", "bg", "fontSize"]);
            });
        });

        describe('logType', () => {
            it(`warn: replaces a lookup that cannot be resolved with an empty string`, () => {
                check(`.a{
                  font-size: 12px;
                  color: $(color|3);
                  background: url("$(bg)");
                }`, `.a{
                  font-size: 12px;
                  color: #fff;
                  background: url("");
                }`, {
                    values: {
                        color: '#fff'
                    }
                })
            });

            it('error: throws when a variable can not be resolved', () => {
                checkWarning(input, { values: {} }, 5);
            });
        });

        describe('values', () => {
            it('plain object: warning when all the can not be resolved', () => {
                checkWarning(input, { values: {} }, 5);
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
            it('un exits file: throws when file path can not be handled', () => {
                expect(new Promise(function() {
                    check(input, outPut, {
                        values: './test/none.js'
                    });
                })).rejects.toThrow(/Unhandled option file:/);
            });
            it('Object literal', () => {
                check(input, outPut, {
                    values
                });
            });
        });
    });

    function check(input, output, opts) {
        const processor = postcss().use(plugin(opts));
        expect(
            stripSpace(processor.process(input).css)
        ).toEqual(
            stripSpace(output)
        );
    }

    function checkExtract(input, output, opts, outArrs) {
        let vars = [];
        if (opts.extract === undefined) {
            opts.extract = function(arr) {
                vars = vars.concat(arr);
            }
        }

        const processor = postcss().use(plugin(opts));
        expect(stripSpace(processor.process(input).css)).toEqual(stripSpace(output));
        expect(vars).toEqual(outArrs);
    }

    function checkError(input, opts) {
        const processor = postcss().use(plugin(opts));
        expect(() => {
            return processor.process(stripSpace(input)).css;
        }).toThrow();
    }

    function checkWarning(input, opts, len) {
        const processor = postcss().use(plugin(opts));
        expect(processor.process(stripSpace(input)).warnings()).toHaveLength(len);
    }

    function stripSpace(input) {
        return input.replace(/\s/g, '');
    }

});