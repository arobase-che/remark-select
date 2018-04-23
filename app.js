'use strict';

const START = '[';
const END_RGX = /(\| *[vV] *])({[^\n]*})?/;

const parseAttr = require('md-attr-parser');

function locator(value, fromIndex) {
  const index = value.indexOf(START, fromIndex);
  return index;
}

function plugin() {
  let END = '|v]';
  function inlineTokenizer(eat, value) {
    if (!this.options.gfm || !value.startsWith(START)) {
      return;
    }

    let subvalue = '';
    let index = 1;
    const length = value.length;
    const now = eat.now();
    now.column += 2;
    now.offset += 2;

    let ret = null;
    if ((ret = value.substr(1).match(END_RGX)) && index < length) {
      subvalue += value.substr(1, ret.index);
      END = ret[1];

      index += ret.index + END.length;
    } else {
      return;
    }

    let letsEat = '';
    let prop = {class: undefined /* [] */, id: undefined};
    if (value.charAt(index) === '{') {
      const res = parseAttr(value, index);
      letsEat = res.eaten;
      index += letsEat.length;
      prop = res.prop;
    }

    if (index <= length) {
      return eat(START + subvalue + END + letsEat)({
        type: 'select',
        children: [],
        data: {
          hName: 'select',
          hProperties: prop,
          hChildren: subvalue.split('|').filter(x => x).map(untrim => {
            const text = untrim.trim();
            return {
              type: 'element',
              tagName: 'option',
              properties: {
                value: text,
              },
              children: [{
                type: 'text',
                value: text,
              }],
            };
          }),
        },
      });
    }
    return true;
  }

  inlineTokenizer.locator = locator;

  const Parser = this.Parser;

  // Inject inlineTokenizer
  const inlineTokenizers = Parser.prototype.inlineTokenizers;
  const inlineMethods = Parser.prototype.inlineMethods;
  inlineTokenizers.select = inlineTokenizer;
  inlineMethods.splice(inlineMethods.indexOf('url'), 0, 'select');

  const Compiler = this.Compiler;

  // Stringify
  if (Compiler) {
    const visitors = Compiler.prototype.visitors;
    visitors.lineselect = function (node) {
      return START + this.all(node).join('') + END;
    };
  }
}

module.exports = plugin;
