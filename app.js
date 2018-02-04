'use strict';

const START = '[';
const END_RGX = /(\| *v *])({[^\n]*})?/;

function locator (value, fromIndex) {
  const index = value.indexOf(START, fromIndex);
  return index;
}

function parseHTMLparam (value, indexNext) {
  let letsEat = '{';
  indexNext++;

  const eat = chars => {
    let eaten = '';
    while (chars.indexOf(value.charAt(indexNext)) >= 0) {
      letsEat += value.charAt(indexNext);
      eaten += value.charAt(indexNext);
      indexNext++;
    }
    return eaten;
  };
  const eatUntil = chars => {
    let eaten = '';
    while (chars.indexOf(value.charAt(indexNext)) < 0) {
      letsEat += value.charAt(indexNext);
      eaten += value.charAt(indexNext);
      indexNext++;
    }
    return eaten;
  };

  const prop = {key: undefined /* {} */, class: undefined /* [] */, id: undefined};
  let type;

  while (value.charAt(indexNext) !== '}') {
    let labelFirst = '';
    let labelSecond = '';

    eat(' \t\n\r\v');

    if (value.charAt(indexNext) === '}') { // Fin l'accolade
      continue;
    } else if (value.charAt(indexNext) === '.') { // Classes
      type = 'class';
      indexNext++;
      letsEat += '.';
    } else if (value.charAt(indexNext) === '#') { // ID
      type = 'id';
      indexNext++;
      letsEat += '#';
    } else { // Key
      type = 'key';
    }

    // Extract name
    labelFirst = eatUntil('=\t\b\r\v  }');

    if (value.charAt(indexNext) === '=') { // Set labelSecond
      indexNext++;
      letsEat += '=';

      if (value.charAt(indexNext) === '"') {
        indexNext++;
        letsEat += '"';
        labelSecond = eatUntil('"}\n');

        if (value.charAt(indexNext) === '"') {
          indexNext++;
          letsEat += '"';
        } else {
          // Erreur
        }
      } else if (value.charAt(indexNext) === '\'') {
        indexNext++;
        letsEat += '\'';
        labelSecond = eatUntil('\'}\n');

        if (value.charAt(indexNext) === '\'') {
          indexNext++;
          letsEat += '\'';
        } else {
          // Erreur
        }
      } else {
        labelSecond = eatUntil(' \t\n\r\v=}');
      }
    }
    switch (type) {
      case 'id': // ID
        prop.id = labelFirst;
        break;
      case 'class':
        if (!prop.class) {
          prop.class = [];
        }
        prop.class.push(labelFirst);
        break;
      case 'key':
        if (labelFirst !== 'id' && labelFirst !== 'class') {
          prop[labelFirst] = labelSecond;
        }
        break;
      default:
    }
  }
  letsEat += '}';

  return {type, prop, eaten: letsEat};
}

function plugin () {
  let END = '|v]';
  function inlineTokenizer (eat, value, silent) {
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
    if ((ret = value.substr(1).match(END_RGX)) && ++index < length) {
      subvalue += value.substr(1, ret.index);
      END = ret[0];

      index += ret.index;
      if (value.charAt(index) === '\n') {
        return true;
      }
    } else {
      return;
    }
    let letsEat = '';
    let prop = {key: undefined /* {} */, class: undefined /* [] */, id: undefined};
    if (value.charAt(index + END.length) === '{') {
      const res = parseHTMLparam(value, index + END.length);
      letsEat = res.eaten;
      prop = res.prop;
    }

    /* istanbul ignore if - never used (yet) */
    if (silent) {
      return true;
    }

    if (prop.type !== 'password') {
      prop.type = 'text';
    }

    prop.placeholder = subvalue.replace(/^_*/g, '').replace(/_*$/g, '');

    if (index < length) {
      return eat(START + subvalue + END + letsEat)({
        type: 'select',
        data: {
          hName: 'select',
          hProperties: prop,
          hChildren: subvalue.split('|').map(untrim => {
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
