import { wordmarkText } from './wordmark.js';
import blessed from 'blessed';
import { telnet } from './lib/telnet.js';
import { getFrontPage } from './stories.js';

const buttons = [];


const createButton = (onClick, text) => {

  const button = blessed.box({
    left: 'center',
    top: 'center',
    width: shrink
  })
}

const selectNextLink = (ch, key) => {
}

telnet({ tty: true }, (client) => {
  let smallMode = false;
  client.on('term', (terminal) => {
    screen.terminal = terminal;
    screen.render();
  });

  client.on('size', function(width, height) {
    client.columns = width;
    client.rows = height;
    client.emit('resize')


    if (width < 100) {
      smallMode = true;
    } else {
      smallMode = false;
    }
    main.position.width = smallMode ? '100%' : 100;
    screen.render();
  });

  let screen = blessed.screen({
    smartCSR: true,
    // input: client,
    output: client,
    terminal: 'xterm-256color',
    fullUnicode: true,
    cursor: 'block'
    // cursor: {
    //   artificial: true,
    //   shape: {
    //     bg: 'red',
    //     fg: 'white',
    //     bold: true,
    //     ch: '#'
    //   },
    //   blink: true
    // }
  });

  client.on('close', function() {
    if (!screen.destroyed) {
      screen.destroy();
    }
  });

  screen.key(['C-c', 'q'], function(ch, key) {
    screen.destroy();
  });

  screen.key(['tab',], function(ch, key) {
    selectNextLink();
  });

  screen.on('destroy', function() {
    if (client.writable) {
      client.destroy();
    }
  });

  const main = blessed.box({
    parent: screen,
    left: 'center',
    top: 'center',
    width: smallMode ? '100%' : 100,
    height: '100%',
    // border: 'line',
  });


  const logoBox = blessed.box({
    top: 'top',
    right: 0,
    width: '100%',
    height: 'shrink',
    padding: 1,
    tags: true,
    style: {
      bg: '#001166',
      fg: 'white',
      // border: {
      //   fg: '#f0f0f0'
      // },
    }
  });


  const wordmark = blessed.box({
    top: 'top',
    right: 0,
    width: 'shrink',
    height: 'shrink',
    padding: 1,
    content: wordmarkText,
    tags: true,
    style: {
      fg: 'white',
      bg: '#001166',
    }
  });

  // wordmark.on('click', function(data) {
  //   console.log("hello")
  //   box.setContent('{center}Some different {red-fg}content{/red-fg}.{/center}');
  //   screen.render();
  // });

  screen.append(main)
  // main.append(logoBox)
  logoBox.append(wordmark)

  getFrontPage().then(collections => {
    // console.log("hello")
    collections.forEach( collection => {
      if (collection.displayName){
        const story = blessed.box({ 
          top: 'top',
          right: 0,
          width: '100%',
          content: collection.displayName,
          style: {
            fg: 'white',
            bg: '#000',
          }
        })
        console.log(collection.displayName)
        main.append(story)
      }
    })
  })

  screen.render();
}).listen(2300);
