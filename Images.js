const cheerio = window.require('cheerio');
const axios = window.require('axios');
const { fixUrl, getName, checkIcon, urlToName } = require('./tools.js');
request = require('request');

const fs = window.require('fs');
const pathModule = window.require('path');

// function for test purposes
function warn(msg = 'Warning!')
{
    console.warn(msg);
}

async function saveImage(name, ImagePath, dir) {
    const path = pathModule.resolve(dir, name);
    request.head(ImagePath, function(err, res, body){
        request(ImagePath).pipe(fs.createWriteStream(dir + name));
        console.log("Downloaded " + name);
    });
}

// save a list of images in a folder with the name of their page
function saveImages(page, images) {
  let url = images[page];
  let dir = 'images/'
  if (!fs.existsSync(dir))
      fs.mkdirSync(dir);
  dir += urlToName(page) + '/';
  if (!fs.existsSync(dir))
      fs.mkdirSync(dir);
  for (let i = 0; i < url.length; i++) {
        saveImage(i + '.png', fixUrl(url[i]), dir);
  }
}

async function savePath(event) {
    await images.scrape(path);
    console.log(images.images);
    document.getElementById('scrap-images').innerHTML = images.inject();
}

function pathChange(event) {
  path = event;
  console.log(path);
}

function downloadImages() {
    for (let page in images.images) {
        saveImages(page, images.images);
    }
}

function deleteImage(name) {
    console.log("trying to delete " + name);
    for (let page in images.images) {
        for (let image of images.images[page]) {
            if (name === image)
            {
                images.images[page].splice(images.images[page].indexOf(image), 1);
                console.log(images.images);
                document.getElementById('scrap-images').innerHTML = images.inject();
                return;
            }
        }
    }
}

class Images {
    constructor() {
        this.images = {};
    }

    async scrape(url) {
        try {
            const page = await axios.get(url, function (req, res) {
                res.header('Access-Control-Allow-Origin: *');
                res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            });
            if (page.status !== 200)
                return;
            const $ = cheerio.load(page.data);
            const images = $('img');
            this.images[url] = [];
            for (let i = 0; i < images.length; i++) {
                const image = images[i];
                const src = image.attribs.src;
                if (src)
                {
                    if (!checkIcon(src))
                        this.images[url].push(fixUrl(src));
                }
            }
            return this.images;
        }
        catch (error) {
            console.warn(error);
        }
    }

    inject() {
        let html = '';
        let id;
        for (let page in this.images) {
            id = 0;
            html += `<div class="page">${page}`;
            for (let image of this.images[page]) {
                id++;
                html += `<li><img src="${image}"><button name="${image}" onclick="deleteImage(this.name)">Delete</button></li>`;
            }
        }
        html += '</div>';
        return html;
    }
}

const images = new Images();
let path = "";