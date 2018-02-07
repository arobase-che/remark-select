import {readFileSync as file} from 'fs';
import {join} from 'path';
import unified from 'unified';

import test from 'ava';
import raw from 'rehype-raw';
import reParse from 'remark-parse';
import stringify from 'rehype-stringify';
import remark2rehype from 'remark-rehype';

import plugin from '../app';

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

test('select-snap', t => {
  const {contents} = render(file(join(__dirname, 'select.md')));
  t.snapshot(contents);
});

test('select-empty', t => {
  const {contents} = render('[|v]');
  t.is(contents, '<p><select></select></p>');
});

test('select-simple', t => {
  const {contents} = render('[ Start | Restart | Quit |v]');
  t.is(contents, `<p><select>\
<option value="Start">Start</option>\
<option value="Restart">Restart</option>\
<option value="Quit">Quit</option>\
</select></p>`);
});

test('select-raw-normal-snap', t => {
  const {contents} = renderRaw(file(join(__dirname, 'select.md')));
  t.snapshot(contents);
});

test('select-raw-snap', t => {
  const {contents} = renderRaw(file(join(__dirname, 'select-raw.md')));
  t.snapshot(contents);
});

test('select-id', t => {
  const {contents} = render('[ Start | Restart | Quit |v]{#hedgedog}');
  t.is(contents, `<p><select id="hedgedog">\
<option value="Start">Start</option>\
<option value="Restart">Restart</option>\
<option value="Quit">Quit</option>\
</select></p>`);
});

test('select-multi-id', t => {
  const {contents} = render('[ Luigi | Mario | Peach | Falco | Zelda |v]{#ssb #nintendo #link #starFox}');
  t.is(contents, `<p><select id="ssb">\
<option value="Luigi">Luigi</option>\
<option value="Mario">Mario</option>\
<option value="Peach">Peach</option>\
<option value="Falco">Falco</option>\
<option value="Zelda">Zelda</option>\
</select></p>`);
});

test('select-class', t => {
  const {contents} = render('[ Luigi | Mario | Peach |v]{.nintendo}');
  t.is(contents, `<p><select class="nintendo">\
<option value="Luigi">Luigi</option>\
<option value="Mario">Mario</option>\
<option value="Peach">Peach</option>\
</select></p>`);
});

test('select-classes', t => {
  const {contents} = render('[ Luigi | Mario | Peach | Falco | Zelda |v]{.mario .link .starFox}');
  t.is(contents, `<p><select class="mario link starFox">\
<option value="Luigi">Luigi</option>\
<option value="Mario">Mario</option>\
<option value="Peach">Peach</option>\
<option value="Falco">Falco</option>\
<option value="Zelda">Zelda</option>\
</select></p>`);
});

test('select-key-value', t => {
  const {contents} = render('[ Falco | Fox |v]{game="Star Fox"}');
  t.is(contents, `<p><select game="Star Fox">\
<option value="Falco">Falco</option>\
<option value="Fox">Fox</option>\
</select></p>`);
});

test.todo('classes key-value id');
test.todo('overwrite class');
test.todo('overwrite id');
