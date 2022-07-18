const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const {fixUrl, getName, checkIcon, urlToName} = require('./tools.js');
const urlExist = (...args) => import('url-exist').then(({default: fetch}) => fetch(...args));

images = {};

async function saveImage(name, path, dir)
{
    let exists = await urlExist(path);
    if (!exists)
    {
        console.log(`Image ${path} doesn't exist`);
        return;
    }
    await new Promise(async function(resolve, reject) {
        try {
            fetch(path).then(async data => {
                data.body.pipe(fs.createWriteStream(dir + name)).on('finish', () => resolve())
                console.log(name + ' saved');
            });
        } catch (error) {
            console.log('could not save image at ' + path);
        }
    });
}

// save a list of images in a folder with the name of their page
function saveImages(page)
{
    let url = images[page];
    let dir = 'images/'
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir);
    dir += urlToName(page) + '/';
    console.log(dir);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir);
    for (let i = 0; i < url.length; i++)
    {
        if (!checkIcon(url[i]))
            saveImage(getName(url[i]) + i + '.png', fixUrl(url[i]), dir);
    }
}

async function scrape(url)
{
    try {
        const page = await axios.get(url);
        if (page.status !== 200)
            return;
        const $ = cheerio.load(page.data);
        const images = $('img');
        this.images[url] = [];
        for (let i = 0; i < images.length; i++)
        {
            const image = images[i];
            const src = image.attribs.src;
            if (src)
                this.images[url].push(src);
        }
        return this.images;
    } catch (error) {
        console.log('link unreachable');
    }
}

function dropImages() {
    console.log(images);
    Object.keys(images).map(key => {
        saveImages(key);
    });
}

// #region test area
async function test()
{
    await scrape('https://fusion-acoustic.com/');
    await scrape('https://fusion-acoustic.com/devore-fidelity/');
    dropImages();
}
test();
// #endregion

module.exports = {
    scrape,
    dropImages
}