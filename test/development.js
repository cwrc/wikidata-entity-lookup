'use strict';

// file on which to run browserify when manually testing (in a browser)
// or working on the module (to see the effect of changes in the browser).

let wikidata = require('../src/index.js');

let queryStringForError = 'miles';
let url = wikidata.getOrganizationLookupURI(queryStringForError);
console.log('the viaf organization url: ')
console.log(url)

// DON'T FORGET TO RUN THE BROWSERIFY COMMAND (FROM PACKAGE.JSON) BEFORE LOADING IN A BROWSER
console.log('the person lookup uri: ')
console.log(wikidata.getPersonLookupURI('jones'))

console.log('the place lookup uri: ')
console.log(wikidata.getPlaceLookupURI('jones'))

console.log('the organization lookup uri: ')
console.log(wikidata.getOrganizationLookupURI('jones'))

console.log('the title lookup uri: ')
console.log(wikidata.getTitleLookupURI('jones'))

wikidata.findPerson('jones').then((result)=>{
    console.log('a lookup of jones in people: ')
    console.log(result)
})

wikidata.findPlace('jones').then((result)=>{
    console.log('a lookup of jones in place: ')
    console.log(result)
})

wikidata.findOrganization('jones').then((result)=>{
    console.log('a lookup of jones in organization: ')
    console.log(result)
})

wikidata.findTitle('jones').then((result)=>{
    console.log('a lookup of jones in title: ')
    console.log(result)
})

