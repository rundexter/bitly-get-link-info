var req  = require('superagent')
  , q    = require('q')
  , _    = require('lodash')
;
  
module.exports = {

    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var links          = step.input('link')
          , token          = dexter.provider('bitly').credentials('access_token')
          , api            = '/v3/info'
          , promises       = []
          , items          = []
        ;

        links.each(function(link) {
            var deferred       = q.defer();

            req.get('https://api-ssl.bitly.com/v3/link/info?access_token='+token+'&link='+link)
                .end(function(err, response) {
                    items.push(_.get(response, 'body.data'));

                    return err || response.statusCode !== 200
                      ? deferred.reject()
                      : deferred.resolve()
                    ;
                });

            promises.push(deferred.promise);
        });

        q.all(promises)
          .then(this.complete.bind(this, items))
          .catch(this.fail.bind(this))
        ;
    }
};
