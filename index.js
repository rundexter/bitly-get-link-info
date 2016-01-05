var util = require('./util.js');
var request = require('request').defaults({
    baseUrl: 'https://api-ssl.bitly.com/'
});

var pickInputs = {
        'link': 'link'
    },
    pickOutputs = {
        'canonical_url': 'data.canonical_url',
        'category': 'data.category',
        'content_length': 'data.content_length',
        'content_type': 'data.content_type',
        'domain': 'data.domain',
        'favicon_url': 'data.favicon_url',
        'html_title': 'data.html_title'
    };

module.exports = {

    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var inputs = util.pickInputs(step, pickInputs),
            validateErrors = util.checkValidateErrors(inputs, pickInputs),
            token = dexter.environment('bitly_access_token'),
            api = '/v3/link/info';

        if (!token)
            return this.fail('A [bitly_access_token] environment variable is required for this module');

        if (validateErrors)
            return this.fail(validateErrors);

        inputs.access_token = token;
        request.get({uri: api, qs: inputs, json: true}, function (error, response, body) {
            if (error)
                this.fail(error);
            else if (body && body.status_code !== 200)
                this.fail(body);
            else
                this.complete(util.pickOutputs(body, pickOutputs));
        }.bind(this));
    }
};
