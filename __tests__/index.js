'use strict';

/* Compatibility support
import unified from 'unified';

import raw from 'rehype-raw';
import reParse from 'remark-parse';
import stringify from 'rehype-stringify';
import remark2rehype from 'remark-rehype';
import parse5 from 'parse5';

import test from 'tape';
import plugin from '../app';
*/

const unified = require('unified');
const raw = require('rehype-raw');
const reParse = require('remark-parse');
const stringify = require('rehype-stringify');
const remark2rehype = require('remark-rehype');
const parse5 = require('parse5');
const dom5 = require('dom5');
const test = require('ava');
const isequal = require('is-equal');
const plugin = require('..');

const render = text => unified()
  .use(reParse)
  .use(plugin)
  .use(remark2rehype)
  .use(stringify)
  .processSync(text);

const renderRaw = text => unified()
  .use(reParse)
  .use(plugin)
  .use(remark2rehype, {allowDangerousHTML: true})
  .use(raw)
  .use(stringify)
  .processSync(text);

const parse = content => parse5.parse(content);

const isIn = (value, array) => {
  let ret = false;
  array.forEach(elem => {
    if (isequal(elem, value)) {
      ret = true;
    }
  });
  return ret;
};

test('select-empty', t => {
  const {contents} = render('[|v]');
  t.deepEqual(parse(contents), parse('<p><select></select></p>'));
});

test('select-simple', t => {
  const {contents} = render('[ Start | Restart | Quit |v]');
  t.deepEqual(parse(contents), parse('<p><select><option value="Start">Start</option><option value="Restart">Restart</option><option value="Quit">Quit</option></select></p>'));
});

test('select-id', t => {
  const {contents} = render('[ Start | Restart | Quit |v]{#hedgedog}');
  const htmlAst = parse(contents);
  const resultHtmlAst = parse('<p><select id="hedgedog"><option value="Start">Start</option><option value="Restart">Restart</option><option value="Quit">Quit</option></select></p>');
  t.deepEqual(htmlAst, resultHtmlAst);
});

test('select-multi-id', t => {
  const {contents} = render('[ Luigi | Mario | Peach | Falco | Zelda |v]{#ssb #nintendo #link #starFox}');
  t.deepEqual(parse(contents), parse('<p><select id="ssb"><option value="Luigi">Luigi</option><option value="Mario">Mario</option><option value="Peach">Peach</option><option value="Falco">Falco</option><option value="Zelda">Zelda</option></select></p>'));
});

test('select-class', t => {
  const {contents} = render('[ Luigi | Mario | Peach |v]{.nintendo}');
  t.deepEqual(parse(contents), parse('<p><select class="nintendo"><option value="Luigi">Luigi</option><option value="Mario">Mario</option><option value="Peach">Peach</option></select></p>'));
});

test('select-classes', t => {
  const {contents} = render('[ Luigi | Mario | Peach | Falco | Zelda |v]{.mario .link .starFox}');
  t.deepEqual(parse(contents), parse('<p><select class="mario link starFox"><option value="Luigi">Luigi</option><option value="Mario">Mario</option><option value="Peach">Peach</option><option value="Falco">Falco</option><option value="Zelda">Zelda</option></select></p>'));
});

test('classes key-value id', t => {
  const {contents} = render('[ Falco | Fox |v]{game="Star Fox" .cyber #fox-mac-cloud}');
  const result = parse(contents);
  const expected = [{name: 'class', value: 'cyber'},
    {name: 'game', value: 'Star Fox'},
    {name: 'id', value: 'fox-mac-cloud'}];

  // Object is : html -> [head, *body*]  -> p -> select
  const {attrs} = result.childNodes[0].childNodes[1].childNodes[0].childNodes[0];
  let isok = true;

  // This test comparaison is NOT perfect.
  // But still good for what we want
  //
  // Here, we test if every attributes we must include are.
  expected.forEach(e => {
    if (!isIn(e, attrs)) {
      t.fail();
      isok = false;
    }
  });

  // And the reverse, test if we doesn't create false attributes
  attrs.forEach(e => {
    if (!isIn(e, expected)) {
      t.fail();
      isok = false;
    }
  });
  t.true(isok);
});

test('overwrite class', t => {
  const {contents} = render('[ Falco | Fox |v]{class="game" .otherGame}');
  t.is(contents, '<p><select class="game otherGame"><option value="Falco">Falco</option><option value="Fox">Fox</option></select></p>');
});

test('overwrite id', t => {
  const {contents} = render('[ Falco | Fox |v]{id="fox" #maccloud}');
  t.is(contents, '<p><select id="maccloud"><option value="Falco">Falco</option><option value="Fox">Fox</option></select></p>');
});

test('not a select-box', t => {
  const {contents} = renderRaw('[ Mario | Peach | Luigi v]');

  t.is(null, dom5.query(parse(contents),
    dom5.predicates.hasTagName('select'))
  );
});

test('not a select-box 2', t => {
  const {contents} = renderRaw('[ v]');

  t.is(null, dom5.query(parse(contents),
    dom5.predicates.hasTagName('select'))
  );
});

test('not a select-box 3', t => {
  const {contents} = renderRaw(`
[ Oups | Zut | Sapristi | Vv ]`);

  t.is(null, dom5.query(parse(contents),
    dom5.predicates.hasTagName('select'))
  );
});

test('is a select-box', t => {
  const {contents} = renderRaw('[ Bulbizare | Salameche | Carapuce |v]');

  t.not(null, dom5.query(parse(contents),
    dom5.predicates.hasTagName('select'))
  );
});
test('is a select-box 2', t => {
  const {contents} = renderRaw('[ Bulbizare | Salameche | Carapuce | V]');

  t.not(null, dom5.query(parse(contents),
    dom5.predicates.hasTagName('select'))
  );
});

test('is a select-box 3', t => {
  const {contents} = renderRaw('[ Bulbizare | Salameche | Carapuce |  V  ]');

  t.not(null, dom5.query(parse(contents),
    dom5.predicates.hasTagName('select')));
});

test('is an empty select-box', t => {
  const {contents} = renderRaw('[|v]');

  t.not(null, dom5.query(parse(contents),
    dom5.predicates.hasTagName('select'))
  );
});
