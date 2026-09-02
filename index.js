const express = require('express');
const cheerio = require('cheerio');
const rateLimit = require('express-rate-limit');
const dns = require('dns').promises;

const app = express();

app.use(express.static('public'));
const scrapeLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    message: {
        error: 'Too many requests. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

app.use(['/scrape', '/custom', '/extract'], scrapeLimiter);

app.get('/', function(req, res) {
    res.send('Welcome to CrawlAI 🚀');
});

// ==========================================
// URL SECURITY
// ==========================================

async function validateUrl(inputUrl) {

    let parsedUrl;

    try {
        parsedUrl = new URL(inputUrl);
    } catch (error) {
        throw new Error('Invalid URL');
    }

    // Only allow HTTP and HTTPS
    if (
        parsedUrl.protocol !== 'http:' &&
        parsedUrl.protocol !== 'https:'
    ) {
        throw new Error('Only HTTP and HTTPS URLs are allowed');
    }

    const hostname = parsedUrl.hostname.toLowerCase();

    // Block localhost
    if (
        hostname === 'localhost' ||
        hostname === 'localhost.localdomain'
    ) {
        throw new Error('Localhost URLs are not allowed');
    }

    // Block common private/local hostnames
    if (
        hostname.endsWith('.local') ||
        hostname.endsWith('.internal')
    ) {
        throw new Error('Private network URLs are not allowed');
    }

    // Resolve hostname to IP
    try {

        const addresses = await dns.lookup(
            hostname,
            {
                all: true
            }
        );

        for (const address of addresses) {

            const ip = address.address;

            // IPv4 private/local ranges
            if (
                ip.startsWith('10.') ||
                ip.startsWith('127.') ||
                ip.startsWith('192.168.') ||
                ip.startsWith('169.254.')
            ) {
                throw new Error(
                    'Private or local IP addresses are not allowed'
                );
            }

            // 172.16.0.0 - 172.31.255.255
            if (ip.startsWith('172.')) {

                const secondPart =
                    Number(ip.split('.')[1]);

                if (
                    secondPart >= 16 &&
                    secondPart <= 31
                ) {
                    throw new Error(
                        'Private IP addresses are not allowed'
                    );
                }

            }

            // IPv6 localhost
            if (
                ip === '::1' ||
                ip.startsWith('fc') ||
                ip.startsWith('fd')
            ) {
                throw new Error(
                    'Private or local IP addresses are not allowed'
                );
            }

        }

    } catch (error) {

        if (
            error.message.includes(
                'Private'
            ) ||
            error.message.includes(
                'local'
            )
        ) {
            throw error;
        }

        throw new Error(
            'Unable to validate website address'
        );

    }

    return parsedUrl.href;
}

// ==========================================
// PRODUCTS SCRAPER
// ==========================================

app.get('/scrape', async function(req, res) {

    // const url = req.query.url;

    // if (!url) {
    //     return res.status(400).json({
    //         error: 'Please provide a URL'
    //     });
    // }

    // try {

    const url = req.query.url;

if (!url) {
    return res.status(400).json({
        error: 'Please provide a URL'
    });
}

try {

    await validateUrl(url);

        const response = await fetch(url, {
    signal: AbortSignal.timeout(15000)
});

        if (!response.ok) {
            throw new Error(
                `Website returned status ${response.status}`
            );
        }

        const html = await response.text();

        const $ = cheerio.load(html);

        const books = [];

        $('article.product_pod').each(function(index, book) {

            const title = $(book)
                .find('h3 a')
                .attr('title');

            const priceText = $(book)
                .find('.price_color')
                .text();

            const price = parseFloat(
                priceText.replace('£', '')
            );

            const availability = $(book)
                .find('.availability')
                .text()
                .trim();

            const ratingClass = $(book)
                .find('.star-rating')
                .attr('class');

            const ratingMap = {
                One: 1,
                Two: 2,
                Three: 3,
                Four: 4,
                Five: 5
            };

            const rating = ratingClass
                ? ratingMap[ratingClass.split(' ')[1]]
                : 0;

            const bookUrl = new URL(
                $(book).find('h3 a').attr('href'),
                url
            ).href;

            const imageUrl = new URL(
                $(book).find('img').attr('src'),
                url
            ).href;

            books.push({
                title: title,
                price: price,
                url: bookUrl,
                image: imageUrl,
                availability: availability,
                rating: rating
            });

        });

        res.json(books);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

});


// ==========================================
// CUSTOM SCRAPER
// ==========================================

app.get('/custom', async function(req, res) {

    // IMPORTANT: URL WAS MISSING HERE
    const url = req.query.url;

    const itemSelector = req.query.itemSelector;
    const titleSelector = req.query.titleSelector;
    const priceSelector = req.query.priceSelector;
    const availabilitySelector = req.query.availabilitySelector;
    const imageSelector = req.query.imageSelector;
    const urlSelector = req.query.urlSelector;


    if (!url) {
        return res.status(400).json({
            error: 'Please provide a URL'
        });
    }


    if (!itemSelector) {
        return res.status(400).json({
            error: 'Please provide an item selector'
        });
    }


    // try {

    //     const response = await fetch(url);
    try {

    await validateUrl(url);

    const response = await fetch(url, {
    signal: AbortSignal.timeout(15000)
});

        if (!response.ok) {
            throw new Error(
                `Website returned status ${response.status}`
            );
        }


        const html = await response.text();

        const $ = cheerio.load(html);

        const results = [];


        $(itemSelector).each(function(index, item) {

            const data = {};


            // TITLE
            if (titleSelector) {

                data.title = $(item)
                    .find(titleSelector)
                    .text()
                    .replace(/\s+/g, ' ')
                    .trim();

            }


            // PRICE
            if (priceSelector) {

                data.price = $(item)
                    .find(priceSelector)
                    .text()
                    .replace(/\s+/g, ' ')
                    .trim();

            }


            // AVAILABILITY
            if (availabilitySelector) {

                data.availability = $(item)
                    .find(availabilitySelector)
                    .text()
                    .replace(/\s+/g, ' ')
                    .trim();

            }


            // IMAGE
            if (imageSelector) {

                const image = $(item)
                    .find(imageSelector)
                    .attr('src');

                if (image) {

                    data.image = new URL(
                        image,
                        url
                    ).href;

                }

            }


            // URL
            if (urlSelector) {

                const link = $(item)
                    .find(urlSelector)
                    .attr('href');

                if (link) {

                    data.url = new URL(
                        link,
                        url
                    ).href;

                }

            }


            results.push(data);

        });


        res.json(results);


    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

});


// ==========================================
// EVERYTHING EXTRACTOR
// ==========================================

app.get('/extract', async function(req, res) {

    const url = req.query.url;


    if (!url) {

        return res.status(400).json({
            error: 'Please provide a URL'
        });

    }


    // try {

    //     const response = await fetch(url);
try {

    await validateUrl(url);

    const response = await fetch(url, {
    signal: AbortSignal.timeout(15000)
});

        if (!response.ok) {

            throw new Error(
                `Website returned status ${response.status}`
            );

        }


        const html = await response.text();

        const $ = cheerio.load(html);


        // Remove unnecessary elements

        $('script').remove();
        $('style').remove();
        $('noscript').remove();


        // TITLE

        const title = $('title')
            .first()
            .text()
            .trim();


        // DESCRIPTION

        const description =
            $('meta[name="description"]')
            .attr('content') || '';


        // HEADINGS

        const headings = [];


        $('h1, h2, h3').each(function() {

            const text = $(this)
                .text()
                .replace(/\s+/g, ' ')
                .trim();


            if (text) {
                headings.push(text);
            }

        });


        // LINKS

        const links = [];


        $('a[href]').each(function() {

            const text = $(this)
                .text()
                .replace(/\s+/g, ' ')
                .trim();

            const href = $(this)
                .attr('href');


            if (href) {

                try {

                    const absoluteUrl =
                        new URL(href, url).href;


                    links.push({
                        text: text,
                        url: absoluteUrl
                    });

                } catch (error) {

                    // Ignore invalid URLs

                }

            }

        });


        // IMAGES

        const images = [];


        $('img[src]').each(function() {

            const src = $(this)
                .attr('src');


            if (src) {

                try {

                    const absoluteUrl =
                        new URL(src, url).href;


                    images.push(absoluteUrl);

                } catch (error) {

                    // Ignore invalid image URLs

                }

            }

        });


        // TEXT

        const text = $('body')
            .text()
            .replace(/\s+/g, ' ')
            .trim();


        res.json({

            url: url,

            title: title,

            description: description,

            headings: headings,

            links: links,

            images: images,

            text: text

        });


    } catch (error) {

        res.status(500).json({

            error: error.message

        });

    }

});


// ==========================================
// START SERVER
// ==========================================

app.listen(3000, function() {

    console.log(
        'CrawlAI is running on http://localhost:3000'
    );

});