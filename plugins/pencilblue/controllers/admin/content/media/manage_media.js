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
 * Interface for managing media
 */

function ManageMedia(){}

//inheritance
util.inherits(ManageMedia, pb.BaseController);

//statics
var SUB_NAV_KEY = 'manage_media';

ManageMedia.prototype.render = function(cb) {
	var self = this;

    var options = {
        select: {
            name: 1,
            caption: 1,
            last_modified: 1,
            media_type: 1,
			location: 1
        },
        order: {created: pb.DAO.DESC},
        format_media: true
    };
    var mservice = new pb.MediaService();
    mservice.get(options, function(err, mediaData) {
        if(util.isError(mediaData) || mediaData.length === 0) {
            self.redirect('/admin/content/media/new', cb);
            return;
        }

        var angularObjects = pb.js.getAngularObjects(
        {
            navigation: pb.AdminNavigation.get(self.session, ['content', 'media'], self.ls),
            pills: pb.AdminSubnavService.get(SUB_NAV_KEY, self.ls, 'manage_media'),
            media: pb.MediaService.formatMedia(mediaData)
        });

        var title = self.ls.get('MANAGE_MEDIA');
        self.setPageName(title);
		self.ts.registerLocal('angular_objects', new pb.TemplateValue(angularObjects, false));
        self.ts.load('admin/content/media/manage_media', function(err, result) {
           cb({content: result});
        });
    });
};

ManageMedia.getSubNavItems = function(key, ls, data) {
	return [{
		name: 'manage_media',
		title: ls.get('MANAGE_MEDIA'),
		icon: 'refresh',
		href: '/admin/content/media'
	}, {
		name: 'new_media',
		title: '',
		icon: 'plus',
		href: '/admin/content/media/new'
	}];
};

//register admin sub-nav
pb.AdminSubnavService.registerFor(SUB_NAV_KEY, ManageMedia.getSubNavItems);

//exports
module.exports = ManageMedia;
