'use strict';

/*
     config is passed through to fetch, so could include things like:
     {
         method: 'get',
         credentials: 'same-origin'
    }
*/
const wdk = require('wikidata-sdk')

function fetchWithTimeout(url, config = {}, timeout = 8000) {

        return new Promise((resolve, reject) => {
            // the reject on the promise in the timeout callback won't have any effect, *unless*
            // the timeout is triggered before the fetch resolves, in which case the setTimeout rejects
            // the whole outer Promise, and the promise from the fetch is dropped entirely.
            setTimeout(() => reject(new Error('Call to Wikidata timed out')), timeout);
            fetch(url, config).then(resolve, reject);
        }).then(
            response=>{
                // check for ok status
                if (response.ok) {
                    return response.json()
                }
                // if status not ok, through an error
                throw new Error(`Something wrong with the call to Wikidata, possibly a problem with the network or the server. HTTP error: ${response.status}`);
            }/*,
            // instead of handling and rethrowing the error here, we just let it bubble through
            error => {
            // we could instead handle a reject from either of the fetch or setTimeout promises,
            // whichever first rejects, do some loggingor something, and then throw a new rejection.
                console.log(error)
                return Promise.reject(new Error(`some error jjk: ${error}`))
            }*/
        )
}

// note that this method is exposed on the npm module to simplify testing,
// i.e., to allow intercepting the HTTP call during testing, using sinon or similar.
function getEntitySourceURI(queryString) {
    // the wdk used below, actually uses the wikidata php api
   return wdk.searchEntities({
        search: queryString,
        format: 'json',
        language: 'en',
        limit: 5
    })
}

function getPersonLookupURI(queryString) {
    return getEntitySourceURI(queryString)
}

function getPlaceLookupURI(queryString) {
    return getEntitySourceURI(queryString)
}

function getOrganizationLookupURI(queryString) {
    return getEntitySourceURI(queryString)
}

function getTitleLookupURI(queryString) {
    return getEntitySourceURI(queryString)
}

function callWikidata(url, queryString) {

    return fetchWithTimeout(url).then((parsedJSON) => {

        return parsedJSON.search.map(
            ({
                 concepturi: uri,
                 label: name,
                 description

             }) => {
                return {
                    nameType: 'unknown',
                    id: uri,
                    uriForDisplay: uri.replace('http', 'https'),
                    uri,
                    name,
                    repository: 'wikidata',
                    originalQueryString: queryString,
                    description
                }
            })

    })
}

function findPerson(queryString) {
    return callWikidata(getPersonLookupURI(queryString), queryString)
}

function findPlace(queryString) {
    return callWikidata(getPlaceLookupURI(queryString), queryString)
}

function findOrganization(queryString) {
    return callWikidata(getOrganizationLookupURI(queryString), queryString)
}

function findTitle(queryString) {
    return callWikidata(getTitleLookupURI(queryString), queryString)
}

module.exports = {
    findPerson: findPerson,
    findPlace: findPlace,
    findOrganization: findOrganization,
    findTitle: findTitle,
    getPersonLookupURI: getPersonLookupURI,
    getPlaceLookupURI: getPlaceLookupURI,
    getOrganizationLookupURI: getOrganizationLookupURI,
    getTitleLookupURI: getTitleLookupURI,
    fetchWithTimeout: fetchWithTimeout
}