(function() {

    'use strict';

    /* eslint-disable angular/no-service-method */
    angular.module('facetApp')

    .service( 'demoService', demoService );

    /* @ngInject */
    function demoService( $q, _, FacetResultHandler, objectMapperService ) {
        var endpointUrl = 'http://ldf.fi/halias/sparql';

        var facets = {
            '<http://rs.tdwg.org/dwc/terms/scientificName>': {
                name: 'Nimi',
                type: 'text',
                enabled: true
            },
            '<http://ldf.fi/schema/halias/rarity>': { name: 'Harvinaisuus' },
            '<http://ldf.fi/schema/halias/hasConservationStatus2010>': { name: 'Uhanalaisuusluokka' },
//            '<http://ldf.fi/schema/halias/hasCharacteristic>': { name: 'Tuntomerkki' }
        //  "Hierarchichal" facet
        '<http://ldf.fi/schema/halias/hasCharacteristic>': {
            name: 'Tuntomerkki',
            type: 'hierarchy',
            property: '<http://www.w3.org/2004/02/skos/core#broader>*',
            classes: [
            '<http://ldf.fi/halias/bird-characteristics/aikajapaikka>',
            '<http://ldf.fi/halias/bird-characteristics/kayttaytyminen>',
            '<http://ldf.fi/halias/bird-characteristics/muotojakoko>',
            '<http://ldf.fi/halias/bird-characteristics/varitysjakuviointi>'
                ]
        },
        '<http://www.yso.fi/onto/taxmeon/isPartOfHigherTaxon>': {
            name: 'Ylemmät taksonit',
            type: 'hierarchy',
            property: '<http://www.yso.fi/onto/taxmeon/isPartOfHigherTaxon>*',
            classes: [
            '<http://www.yso.fi/onto/bio/FMNH_370738>',
                ]
        }
        };
        var resultHandler = new FacetResultHandler(endpointUrl, facets, objectMapperService);

        var facetOptions = {
            endpointUrl: endpointUrl,
            graph : '<http://ldf.fi/halias/observations/>',
            //rdfClass: '<http://www.yso.fi/onto/taxmeon/TaxonInChecklist>',
            rdfClass: '<http://www.yso.fi/onto/taxonomic-ranks/Species>',
            preferredLang : 'fi'
        };

        var prefixes = '' +
            ' PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>' +
            ' PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>' +
            ' PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>' +
            ' PREFIX text: <http://jena.apache.org/text#>' +
            ' prefix hs: <http://ldf.fi/schema/halias/>' +
            ' prefix dwc:   <http://rs.tdwg.org/dwc/terms/>' +
            ' prefix taxmeon: <http://www.yso.fi/onto/taxmeon/>' +
            ' prefix bc:    <http://ldf.fi/halias/bird-characteristics/>' +
            ' prefix ranks: <http://www.yso.fi/onto/taxonomic-ranks/>';

        var resultSet = '' +
            '     SELECT DISTINCT ?id { ' +
                '       GRAPH <http://ldf.fi/halias/observations/> {' +
                    '         <FACET_SELECTIONS> ' +
                    '         ?s a ranks:Species .' +
                    '         BIND(?s AS ?id) ' +
                    '       } ' +
                    '     } ORDER BY ?name ' +
                    '     <PAGE> ';

        var resultSetQry = prefixes + resultSet;

        var query = prefixes +
            ' SELECT ?id ?name ?name_ver ?characteristic ?rarity ?conservation ?upper ' +
            ' WHERE {' +
                '   { ' +
                    '     <RESULTSET> ' +
                        '   } ' +
                        ' GRAPH <http://ldf.fi/halias/observations/> {' +

                    '     ?id dwc:scientificName ?name .' +
                        ' OPTIONAL { ?id hs:rarity ?rarity_uri .' +
                            '   ?rarity_uri rdfs:label ?rarity . ' +
                                '         FILTER(lang(?rarity) = "fi") . }' +
                        ' OPTIONAL { ?id hs:hasConservationStatus2010 ?conservation_uri .' +
                            '   ?conservation_uri rdfs:label ?conservation . ' +
                                '         FILTER(lang(?conservation) = "fi") . }' +
                                ' OPTIONAL { ?id rdfs:label ?name_ver .' +
                                    '         FILTER(lang(?name_ver) = "fi") . }' +
                                    ' OPTIONAL { ?id bc:hasCharacteristic ?chara . }' +
                                    ' OPTIONAL { ?id taxmeon:isPartOfHigherTaxon ?upper . }' +
                                    ' }' +
                                    ' }';

        query = query.replace(/<RESULTSET>/g, resultSet);

        this.getResults = getResults;
        this.getFacets = getFacets;
        this.getFacetOptions = getFacetOptions;

        function getResults(facetSelections) {
            return resultHandler.getResults(facetSelections, query, resultSetQry);
        }

        function getFacets() {
            return facets;
        }

        function getFacetOptions() {
            return facetOptions;
        }
    }
})();
