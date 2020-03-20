'use strict';

import wdk from 'wikidata-sdk';

/*
     config is passed through to fetch, so could include things like:
     {
         method: 'get',
         credentials: 'same-origin'
    }
*/

const fetchWithTimeout = (url, config = {}, time = 30000) => {

    /*
        the reject on the promise in the timeout callback won't have any effect, *unless*
        the timeout is triggered before the fetch resolves, in which case the setTimeout rejects
        the whole outer Promise, and the promise from the fetch is dropped entirely.
    */

    // Create a promise that rejects in <time> milliseconds
    const timeout = new Promise((resolve, reject) => {
        const id = setTimeout(() => {
            clearTimeout(id);
            reject('Call to Wikidata timed out')
        }, time)
    });

    // Returns a race between our timeout and the passed in promise
    return Promise.race([
        fetch(url, config),
        timeout
    ]);
};

// note that this method is exposed on the npm module to simplify testing,
// i.e., to allow intercepting the HTTP call during testing, using sinon or similar.
const getEntitySourceURI = (queryString) => {
    // the wdk used below, actually uses the wikidata php api
    return wdk.searchEntities({
        search: queryString,
        format: 'json',
        language: 'en',
        limit: 5
    });
};

const getPersonLookupURI = (queryString) => getEntitySourceURI(queryString);

const getPlaceLookupURI = (queryString) => getEntitySourceURI(queryString);

const getOrganizationLookupURI = (queryString) => getEntitySourceURI(queryString);

const getTitleLookupURI = (queryString) => getEntitySourceURI(queryString);

const getRSLookupURI = (queryString) => getEntitySourceURI(queryString);

const callWikidata = async (url, queryString) => {

    const response = await fetchWithTimeout(url)
        .catch((error) => {
            return error;
        });

    //if status not ok, through an error
    if (!response.ok) throw new Error(`Something wrong with the call to Wikidata, possibly a problem with the network or the server. HTTP error: ${response.status}`);

    const responseJson = await response.json();

    const results = responseJson.search.map(
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
        });

    return results;
};

const findPerson = (queryString) => callWikidata(getPersonLookupURI(queryString), queryString);

const findPlace = (queryString) => callWikidata(getPlaceLookupURI(queryString), queryString);

const findOrganization = (queryString) => callWikidata(getOrganizationLookupURI(queryString), queryString);

const findTitle = (queryString) => callWikidata(getTitleLookupURI(queryString), queryString);

const findRS = (queryString) => callWikidata(getRSLookupURI(queryString), queryString);

export default {
    findPerson,
    findPlace,
    findOrganization,
    findTitle,
    findRS,
    getPersonLookupURI,
    getPlaceLookupURI,
    getOrganizationLookupURI,
    getTitleLookupURI,
    getRSLookupURI,
    fetchWithTimeout
}