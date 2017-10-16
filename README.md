![Picture](http://cwrc.ca/logos/CWRC_logos_2016_versions/CWRCLogo-Horz-FullColour.png)

[![Travis](https://img.shields.io/travis/cwrc/wikidata-entity-lookup.svg)](https://travis-ci.org/cwrc/wikidata-entity-lookup)
[![Codecov](https://img.shields.io/codecov/c/github/cwrc/wikidata-entity-lookup.svg)](https://codecov.io/gh/cwrc/wikidata-entity-lookup)
[![version](https://img.shields.io/npm/v/wikidata-entity-lookup.svg)](http://npm.im/viaf-entity-lookup)
[![downloads](https://img.shields.io/npm/dm/wikidata-entity-lookup.svg)](http://npm-stat.com/charts.html?package=wikidata-entity-lookup&from=2015-08-01)
[![GPL-3.0](https://img.shields.io/npm/l/wikidata-entity-lookup.svg)](http://opensource.org/licenses/GPL-3.0)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

# wikidata-entity-lookup

1. [Overview](#overview)
1. [Installation](#installation)
1. [Use](#use)
1. [API](#api)
1. [Development](#development)

### Overview

Finds entities (people, places, organizations, titles) in wikidata, through the `search entities` module of the MediaWiki api (wikidata is built on mediawiki).  Meant to be used with [cwrc-public-entity-dialogs](https://github.com/cwrc-public-entity-dialogs) where it runs in the browser.

Although it will not work in node.js as-is, it does use the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) for http requests, and so could likely therefore use a browser/node.js compatible fetch implementation like: [isomorphic-fetch](https://www.npmjs.com/package/isomorphic-fetch).

### Why not SPARQL

wikidata supports sparql (https://www.mediawiki.org/wiki/Wikidata_query_service), but SPARQL has limited support for full text search.  The expectation with SPARQL mostly seems to be that you know exactly what you are matching on
So, a query that exactly details the label works fine:

SELECT DISTINCT ?s WHERE {
  ?s ?label "The Rolling Stones"@en .
  ?s ?p ?o
}

We'd like, however, to match with full text search, so we can match on partial strings, variant spellings, etc.  
Just in the simple case above, for example, someone searching for The Rolling Stones would have to fully specify 'The Rolling Stones' and not just 'Rolling Stones'.  If they left out 'The' then their query won't return the result.

There is a SPARQL CONTAINS operator that can be used within a FILTER, and that matches substrings, which would be better.  
CONTAINS does only supports exact matches of substrings, no fuzzy querying, but for names that might be fine.  

CONTAINS seems to work fine with some data stores like getty, 
but the same query that works on getty will only work occasionally on wikidata and mostly times out.    

There are alternatives to CONTAINS, most notably REGEX, but as described 
here: https://www.cray.com/blog/dont-use-hammer-screw-nail-alternatives-regex-sparql/  REGEX has even worse performance than CONTAINS.  

A further alternative is to use some of the 
custom full text SPARQL search functions that specific triplestores might offer, and maybe since we are controlling the queries that might be fine.  Wikidata, however, doesn’t seem 
to have anything like this, and while support for full text search in SPARQL is planned, it’s been in the queue for a while:  https://phabricator.wikimedia.org/T141813

Wikidata does, though, have another api, the MediaWiki api (wikidata is built on mediawiki):

www.wikidata.org/w/api.php

and in particular, has got a search function for entities that is probably mostly what we want:

https://www.wikidata.org/w/api.php?action=help&modules=wbsearchentities

It does not, however, allow specifying the ‘type’ of the entity, i.e., person, place, etc. (in the way that VIAF does)and so we couldn't easily return results by entity type (which we could with SPARQL).  Instead one has to show results with mixed entity types for any query.  So a query for a person might return results that include any entity type, including places, organizations, or titles.

There are a couple of npm packages for querying wikidata:

https://github.com/kbarresi/wikidata-search
https://www.npmjs.com/package/wikidata-sdk 

Both use the www.wikidata.org/w/api.php API mentioned above.  The wikidata-sdk package also allows SPARQL querying, but again, without full text search — it assumes you know exactly the string you are matching.

In summary, if we knew the exact string to match, then we could use SPARQL and thereby filter by type.

Otherwise, we have to use the custom, non SPARQL api, which supports full text search on entities, but doesn’t allow filtering the entities by entity type (person, place, org, title).

For now, we've chosen the latter.  In particular, we use the wikidata-sdk npm package to construct the URLs for calls to the wikidata entity search api that we then invoke (using the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)) to get our results.

### Installation

npm i wikidata-entity-lookup -S

### Use

let wikidataLookup = require('wikidata-entity-lookup');

### API

###### findPerson(query)

###### findPlace(query)

###### findOrganization(query)  
  
###### findTitle(query)  

<br><br>
where the 'query' argument is an object:  
<br>  

```
{
    entity:  The name of the thing the user wants to find.
    options: TBD 
}
```

<br>
and all find* methods return promises that resolve to an object like the following:
<br><br>  

```
{
    id: "http://wikidata.org/wikidata/9447148209321300460003/"
    
    name: "Fay Jones School of Architecture and Design"
    
    nameType: "Corporate"
    
    originalQueryString: "jones"
    
    repository: "wikidata"
    
    uri: "http://wikidata.org/9447148209321300460003/"
    
}
```
<br><br>
There are a further four methods that are mainly made available to facilitate testing (to make it easier to mock calls to the VIAF service):

###### getPersonLookupURI(query)

###### getPlaceLookupURI(query)

###### getOrganizationLookupURI(query)  
  
###### getTitleLookupURI(query) 

<br><br>
where the 'query' argument is the entity name to find and the methods return the wikidata URL that in turn returns results for the query.

### Development

[CWRC-Writer-Dev-Docs](https://github.com/jchartrand/CWRC-Writer-Dev-Docs) describes general development practices for CWRC-Writer GitHub repositories, including this one.

#### Testing

The code in this repository is intended to run in the browser, and so we use [browser-run](https://github.com/juliangruber/browser-run) to run [browserified](http://browserify.org) [tape](https://github.com/substack/tape) tests directly in the browser. 

We [decorate](https://en.wikipedia.org/wiki/Decorator_pattern) [tape](https://github.com/substack/tape) with [tape-promise](https://github.com/jprichardson/tape-promise) to allow testing with promises and async methods.  

#### Mocking

We use [fetch-mock](https://github.com/wheresrhys/fetch-mock) to mock http calls (which we make using the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) rather than XMLHttpRequest). 

We use [sinon](http://sinonjs.org) [fake timers](http://sinonjs.org/releases/v4.0.1/fake-timers/) to test our timeouts, without having to wait for the timeouts.

#### Code Coverage  

We generate code coverage by instrumenting our code with [istanbul](https://github.com/gotwarlost/istanbul) before [browser-run](https://github.com/juliangruber/browser-run) runs the tests, 
then extract the coverage (which [istanbul](https://github.com/gotwarlost/istanbul) writes to the global object, i.e., the window in the browser), format it with [istanbul](https://github.com/gotwarlost/istanbul), and finally report (Travis actually does this for us) to [codecov.io](codecov.io)

#### Transpilation

We use [babelify](https://github.com/babel/babelify) and [babel-plugin-istanbul](https://github.com/istanbuljs/babel-plugin-istanbul) to compile our code, tests, and code coverage with [babel](https://github.com/babel/babel)  

#### Continuous Integration

We use [Travis](https://travis-ci.org).

Note that to allow our tests to run in Electron on Travis, the following has been added to .travis.yml:

```
addons:
  apt:
    packages:
      - xvfb
install:
  - export DISPLAY=':99.0'
  - Xvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 &
  - npm install
```

#### Release

We follow [SemVer](http://semver.org), which [Semantic Release](https://github.com/semantic-release/semantic-release) makes easy.  
Semantic Release also writes our commit messages, sets the version number, publishes to NPM, and finally generates a changelog and a release (including a git tag) on GitHub.

