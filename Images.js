const cheerio = require('cheerio');
const axios = require('axios');
const { fixUrl, getName, checkIcon, urlToName, urlToPath } = require('./tools.js');
request = require('request');
const { clipboard } = require('electron')
const downloadsFolder = require('downloads-folder');

const fs = require('fs');
const pathModule = require('path');

const downloadPath = downloadsFolder();

let urlObject;

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
  let dir = downloadPath + '/images/'
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
    urlObject = new URL(path);
    console.log(urlObject.hostname);
    if (allSite)
    {
        try {
            const page = await axios.get(fixUrl(urlObject.hostname), function (req, res) {
                res.header('Access-Control-Allow-Origin: *');
                res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            });
            if (page.status !== 200)
                return;
            const $ = cheerio.load(page.data);
            let links = $('a');
            $(links).each(async function (i, link) {
                let url = fixUrl($(link).attr('href'));
                console.log(url);
                if (!visited.includes(url))
                    await images.scrape(url);
            });
        } catch (error) {
            
        }
    }
    
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
    document.getElementById('scrap-images').innerHTML = '';
    images.images = {};
    let fullPath = urlToPath(downloadPath) + "/images/";
    document.getElementById('scrap-images').innerHTML = `<div class="alert alert-success" role="alert"><strong>Success!</strong> Images downloaded in ${fullPath}<button onclick="copyToClipboard('${fullPath}')">Click to copy</button></div>`;

}

function copyToClipboard(copyText) {
    clipboard.writeText(copyText);
    alert("Copied the text: " + copyText);
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

function deletePage(name) {
    console.log("trying to delete page " + name);
    delete images.images[name];
    document.getElementById('scrap-images').innerHTML = images.inject();
}

class Images {
    constructor() {
        this.images = {};
    }

    async scrape(url) {
        visited.push(url);
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
            html += `<div class="page">${page}<button onclick="deletePage('${page}')">Delete Page</button>`;
            for (let image of this.images[page]) {
                id++;
                html += `<li class="container"><img src="${image}" class="image"><div class="middle"><button class="text" name="${image}" onclick="deleteImage(this.name)">Delete</button></div></li>`;
            }
        }
        html += '</div>';
        return html;
    }
}

let allSite = false;

function AllSiteChanged() {
    allSite = !allSite;
}

var visited = [];
const images = new Images();
let path = "";