/*
    Copyright (C) 2014  PencilBlue, LLC

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/**
 * Edits an article
 */

function EditArticle(){}

//inheritance
util.inherits(EditArticle, pb.BaseController);

EditArticle.prototype.render = function(cb) {
	var self = this;
	var vars = this.pathVars;

	this.getJSONPostParams(function(err, post) {
	    post.publish_date = new Date(parseInt(post.publish_date));
		post.id = vars.id;
		delete post._id;

	    var message = self.hasRequiredParams(post, self.getRequiredFields());
	    if (message) {
			cb({
				code: 400,
				content: pb.BaseController.apiResponse(pb.BaseController.API_FAILURE, message)
			});
	        return;
	    }

	    var dao = new pb.DAO();
	    dao.loadById(post.id, 'article', function(err, article) {
	        if(util.isError(err) || article === null) {
				cb({
					code: 400,
					content: pb.BaseController.apiResponse(pb.BaseController.API_FAILURE, self.ls.get('INVALID_UID'))
				});
	            return;
	        }

	        //TODO should we keep track of contributors (users who edit)?
	        post.author = article.author;
	        post = pb.DocumentCreator.formatIntegerItems(post, ['draft']);
	        pb.DocumentCreator.update(post, article, ['meta_keywords']);

	        pb.RequestHandler.urlExists(article.url, post.id, function(error, exists) {
	            if(error !== null || exists || article.url.indexOf('/admin') === 0) {
					cb({
						code: 400,
						content: pb.BaseController.apiResponse(pb.BaseController.API_FAILURE, self.ls.get('EXISTING_URL'))
					});
	                return;
	            }

	            dao.update(article).then(function(result) {
	                if(util.isError(result)) {
	                    cb({
							code: 500,
							content: pb.BaseController.apiResponse(pb.BaseController.API_FAILURE, self.ls.get('ERROR_SAVING'), result)
						});
	                    return;
	                }

					post.last_modified = new Date();
					cb({content: pb.BaseController.apiResponse(pb.BaseController.API_SUCCESS, article.headline + ' ' + self.ls.get('EDITED'), post)});
	            });
	        });
	    });
	});
};

EditArticle.prototype.getRequiredFields = function() {
	return ['url', 'headline', 'article_layout', 'id'];
};


EditArticle.prototype.getSanitizationRules = function() {
    return {
        article_layout: pb.BaseController.getContentSanitizationRules()
    };
};

//exports
module.exports = EditArticle;
