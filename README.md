# remark-select

A [remark](https://github.com/remarkjs/remark/) plugin that parse Mardown syntax to add support for select element.


## Syntax

You can add a select element this way :

```markdown
Who is the stronger ? : [ Samus | Peach | Zelda |v]
```

Wich leads to :

![Screenshot](https://raw.githubusercontent.com/arobase-che/remark-select/master/images/example_1.png)


## Installation

Easy as npm i

```shell
$ npm install remark-line-input
```

You install also that plugins : "unified remark-parse rehype-stringify remark-rehype"
```shell
$ npm install unified remark-parse rehype-stringify remark-rehype
```

## Usage

An example of code :

```js
const unified = require('unified')
const remarkParse = require('remark-parse')
const stringify = require('rehype-stringify')
const remark2rehype = require('remark-rehype')

const select = require('remark-select')

const testFile = `Choose a player : [ Luigi | Mario | Peach | Falco | Zelda |v]{.mario .link .starFox}

Choose an action : [ Start | Restart | Quit |v]`

unified()
  .use(remarkParse)
  .use(select)
  .use(remark2rehype) 
  .use(stringify)
  .process( testFile, (err, file) => {
    console.log(String(file));
  } );
```

## Configuration

This plugin support custom HTML attributes :

```markdown
[ Mario | Peach | Luigi |v]{.nintendo #select-character}
```

## Licence

MIT

