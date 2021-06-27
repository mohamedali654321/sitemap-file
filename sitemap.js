const axios = require('axios');

const fs = require('fs'),
    convert = require('xml-js'),
    fetch = require('node-fetch'),
    moment = require('moment'),
    hostBlogBaseURL = 'http://54.220.211.123:9000/blog',
    getBlogsListURL = `http://54.220.211.123:1336/articles?_locale=all`,
    untrackedUrlsList = [],
    dataFetch=[],
    options = { compact: true, ignoreComment: true, spaces: 4 };


const fetchBlogsList = () => {
    axios(getBlogsListURL)
        .then(res => res.data)
        .then(dataJSON => {
            if (dataJSON) {
                dataFetch.push(dataJSON)
                dataJSON.forEach(element => {
                    const modifiedURL = element.slug.replace(/ /g, '-');
                    const url=`${hostBlogBaseURL}/${modifiedURL}`;
                    const  imageUrl=`http://54.220.211.123:1336${element.image.url}`
                    untrackedUrlsList.push({url:url,title:element.title,author:element.author,translator:element.translator,publishDate:element.publishDate,abstract:element.abstract,image:imageUrl,locale:element.locale,lastmod:element.updated_at,body:element.body})
                    
                   
                });
                filterUniqueURLs();
            }

              
            
        })
        .catch(error => {
            console.log(error);
        });
}



const filterUniqueURLs = () => {
    fs.readFile('sitemap.xml', (err, data) => {
        if (data) {
            const existingSitemapList = JSON.parse(convert.xml2json(data, options));
            let existingSitemapURLStringList = [];
            if (existingSitemapList.urlset && existingSitemapList.urlset.url && existingSitemapList.urlset.url.length) {
                existingSitemapURLStringList = existingSitemapList.urlset.url.map(ele => ele.loc._text);
            }

          
                untrackedUrlsList.forEach(ele => {
                    if (existingSitemapURLStringList.indexOf(ele) == -1) {
                        existingSitemapList.urlset.url.push({
                            loc: {
                                _text: ele.url,
                            },
                            changefreq: {
                                _text: 'monthly'
                            },
                            priority: {
                                _text: 0.8
                            },
                            lastmod: {
                                _text: ele.lastmod
                            },
                            title:{
                                _text:ele.title
                            },
                            author:{
                                _text:ele.author
                            },
                            translator:{
                                _text:ele.translator
                            },
                            publishDate:{
                                _text:ele.publishDate
                            },
                            abstract:{
                                _text:ele.abstract
                            },
                            media:{
                                _text:ele.image
                            },
                            locale:{
                                _text:ele.locale
                            },
                            body:{
                                _text:ele.body
                            }

                        });
                    }
                });

            
                
            

         
            createSitemapFile(existingSitemapList);
        }
    });
}


const createSitemapFile = (list) => {
    const finalXML = convert.json2xml(list, options); 
    saveNewSitemap(finalXML);
}


const saveNewSitemap = (xmltext) => {
    fs.writeFile('sitemap.xml', xmltext, (err) => {
        if (err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
}

fetchBlogsList();