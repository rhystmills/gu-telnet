"use strict";

import { wordmarkText } from './wordmark.js';
import blessed from 'blessed';
import telnet from './lib/telnet.cjs';
import { getFrontPage } from './stories.js';
import fetch from 'node-fetch';
import striptags from 'striptags';
import { colorMap } from './colorMap.js';


const buttons = [];
let activeButton = undefined;

const headerHeight = 8;

let offset = 0;

let home = true;


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
    input: client,
    output: client,
    terminal: 'xterm-256color',
    fullUnicode: true,
    cursor: 'block',
    autoPadding: true
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

  const selectNextLink = (ch, key) => {
    if (activeButton === undefined || activeButton >= buttons.length - 1) {
      activeButton = 0;
      buttons[activeButton].story.style.bg = '#000000'
    } else { 
      buttons[activeButton].story.style.bg = '#000000'
      activeButton++;
    }
    buttons[activeButton].story.style.bg = '#777777'
    screen.render();
  }

  const selectPrevLink = (ch, key) => {
    if (activeButton === undefined) {
      activeButton = buttons.length - 1;
    } else if (activeButton === 0){
      buttons[0].story.style.bg = '#000000'
      activeButton = buttons.length - 1;
    } else { 
      buttons[activeButton].story.style.bg = '#000000'
      activeButton--;
    }
    buttons[activeButton].story.style.bg = '#777777'
    screen.render();
  }

  const clickLink = (ch, key) => {
    if (activeButton !== undefined && main.children[1]) {
      main.children[1].destroy()
      const id = buttons[activeButton].id;
      while (buttons.length) {
        buttons.pop();
      }
      activeButton = undefined;
      home = false;
      addStory(id);
    }
  }

  const addStory = (id) => {
    // console.log(id)
    fetch('https://content.guardianapis.com/' + id + '?show-fields=all&format=json&api-key=gnm-hackday-21')
      .then(response => {
        return response.json();
      })
      .then(data => {
        // console.log(data)
        return { 
          body: striptags(data.response.content.fields.body, [], '\n'),
          headline: striptags(data.response.content.fields.headline),
          trailText: striptags(data.response.content.fields.trailText),
          byline: data.response.content.fields.byline
        }
      })
      .then(article => {
        //Headline
        main.append(
          blessed.box({
            top: headerHeight + 3,
            left: 'left',
            // left: 0,
            mouse: true,
            width: '100%',
            height: 'shrink',
            content: article.headline.toUpperCase(),
            padding: 0,
            style: {
              fg: 'white',
            }
          }) 
        )
        //Trail text
        main.append(
          blessed.box({
            top: headerHeight + 5,
            left: 'left',
            // left: 0,
            mouse: true,
            width: '100%',
            height: 'shrink',
            content: article.trailText,
            padding: 0,
            style: {
              fg: '#777777',
            }
          }) 
        )
        //Byline
        main.append(
          blessed.box({
            top: headerHeight + 7,
            left: 'left',
            // left: 0,
            mouse: true,
            width: '100%',
            height: 'shrink',
            content: article.byline,
            padding: 0,
            style: {
              fg: 'cyan',
            }
          }) 
        )
        //Body
        main.append(
          blessed.box({
            top: headerHeight + 8,
            left: 'left',
            // left: 0,
            mouse: true,
            width: '100%',
            height: 'shrink',
            content: article.body,
            padding: 1,
            border: {
              type: 'line',
              fg: '#aaaaaa'
            },
            style: {
              fg: 'white',
            }
          }) 
        )
        screen.render();
      })
  }

  const returnHome = () => {
    for (let i = main.children.length; i > 1; i--){
      main.children[i - 1].destroy();
    }
    listStories();
    home = true;
  }

  client.on('close', function() {
    if (!screen.destroyed) {
      screen.destroy();
    }
  });

  screen.key(['C-c', 'q'], function(ch, key) {
    screen.destroy();
  });

  screen.key(['right'], function(ch, key) {
    selectNextLink();
  });

  screen.key(['left'], function(ch, key) {
    selectPrevLink();
  });

  screen.key(['enter'], function(ch, key) {
    clickLink();
  });

  screen.key(['backspace'], function(ch, key) {
    if (!home) { 
      returnHome();
    }
  });

  screen.key(['down'], function(ch, key) {
    if (offset <= main.height){ 
      offset++;
    }
    main.top = -offset;
    screen.render();
  });

  screen.key(['up'], function(ch, key) {
    if (offset > 0) {
      offset--;
    }
    main.top = -offset;
    screen.render();
  });

  screen.on('destroy', function() {
    if (client.writable) {
      client.destroy();
    }
  });

  const main = blessed.box({
    parent: screen,
    scrollable: true,
    input: true,
    keys: true,
    mouse: true,
    alwaysScroll:true,
    tags: true,
    scrollback: 100,
    scrollbar: {
      ch: " ",
      inverse: true
    },
    parent: screen,
    left: 'center',
    top: 0 + offset,
    width: smallMode ? '100%' : 100,
    height: 'shrink',
    // border: 'line',
  });

  const logoBox = blessed.box({
    parent: main,
    top: 0,
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
    parent: logoBox,
    top: 0,
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

  const listStories = () => {
    getFrontPage().then(collections => {
      console.log("hello")
      // console.log(collections)
      const feed = blessed.box({
        parent: main,
        top: headerHeight + 1,
        width: '100%',
        height: 'shrink',
        padding: 1,
        tags: true,
        style: {
          fg: 'white',
        }
      })

      const validCollections = collections.filter(
        collection => collection.displayName && collection.content.length > 0
      )
      // console.log(validCollections)
      let currentSectionOffset = 0; 
      
      validCollections.forEach((collection, i) => {
        const sectionOffset = Math.round(collection.content.length/2) * 10;
        fetch('https://api.nextgen.guardianapps.co.uk/container/data/' + collection.id + '.json')
        .then(response => response.json())
        .then(containerData => {
          // console.log(containerData.heading)
          feed.append(blessed.box({ 
            top: i * 10,
            // right: 0,
            left: 0,
            width: 'shrink',
            height: 'shrink',
            content: collection.displayName.toUpperCase(),
            padding: 0,
            style: {
              fg: 'white',
            }
          }))

          feed.append(blessed.line({ 
            top: (i * 10 + 1),
            // right: 0,
            orientation: 'horizontal',
            type: 'line',
            fg: '#f0f0f0'
          }))

          const thisCollection = blessed.box({ 
            top: i * 10 + 2,
            // right: 0,
            left: 0,
            width: '100%',
            height: 8,
            padding: 0,
            style: {
              fg: 'white',
            }
          })
          feed.append(thisCollection);
          
          collection.content.forEach((story, j)=>{
            if (j<2){
              // console.log(story.id)
              const color = colorMap(story.id);
              const kickerText = () => {
                if (containerData.trails && containerData.trails[j] && containerData.trails[j].kickerText){
                  return `{${color}-fg}${containerData.trails[j].kickerText} /{/${color}-fg} `
                }
                return '';
              }
              const thisStory = blessed.box({ 
                top: 'top',
                // right: 0,
                left: j % 2 === 0 ? 0 : '50%',
                // left: 0,
                mouse: true,
                width: '50%',
                tags: true,
                height: 'shrink',
                content: `${kickerText()}${story.headline}`,
                padding: 0,
                border: {
                  type: 'line',
                  fg: '#aaaaaa'
                },
                style: {
                  fg: 'white',
                  hover: {
                    bg: 'green'
                  }
                }
              })
              thisStory.id = story.id;
              buttons.push({story: thisStory, id: story.id});
              // console.log(story.headline)
            
              thisCollection.append(thisStory)
            }
          })
          screen.render();
        })
        screen.render();
      })
      // console.log(list.children.map(item => item.content))
      main.screen.render();
      screen.render();
    }) 
  } 
  
  listStories();
  screen.render();
}).listen(2300);
