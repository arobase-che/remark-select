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

test('select', t => {
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

test('select-raw-normal', t => {
  const {contents} = renderRaw(file(join(__dirname, 'select.md')));
  t.snapshot(contents);
});

test('select-raw', t => {
  const {contents} = renderRaw(file(join(__dirname, 'select-raw.md')));
  t.snapshot(contents);
});

test.todo('id text');
test.todo('class');
test.todo('classes');
test.todo('key-value');
test.todo('classes key-value id');
test.todo('overwrite class');
test.todo('overwrite id');
test.todo('multiple id');

