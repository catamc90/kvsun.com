import $ from './std-js/zq.es6';
import {query, fullScreen} from './std-js/functions.es6';
import supports from './std-js/support_test.es6';
import * as eventHandler from './eventHandlers.es6';
import wysiwyg from './std-js/wysiwyg.es6';
import kbd from './std-js/kbd_shortcuts.es6';
import DnD from './fileupload.es6';
import Reader from './ArticleReader.es6';

function wysiwygToggle(el) {
	if (
		el.hasAttribute('contenteditable')
		&& el.getAttribute('contenteditable') === 'true'
	) {
		el.addEventListener('keydown', kbd);
		DnD(el);

	} else {
		el.removeEventListener('keydown', kbd);
	}
}

// function pictureShim(picture) {
// 	if ('matchMedia' in window) {
// 		let sources = picture.querySelectorAll('source[media][srcset]');
// 		for (let n = 0; n < sources.length; n++) {
// 			if (matchMedia(sources[n].getAttribute('media')).matches) {
// 				picture.getElementsByTagName('img')[0].src = sources[n].getAttribute('srcset');
// 				break;
// 			}
// 		}
// 	} else {
// 		picture.getElementsByTagName('img')[0].src = picture.querySelector('source[media][srcset]').getAttribute('srcset');
// 	}
// }

function toggleFullScreen(){
	if (fullScreen) {
		document.cancelFullScreen();
	} else {
		document.querySelector(this.dataset.fullscreen).requestFullScreen();
	}
}

export const watcher = {
	childList: function() {
		$(this.addedNodes).bootstrap();
		if ($(this.removedNodes).some(node => node.tagName === 'DIALOG')) {
			document.body.removeEventListener('click', eventHandler.closeOnOutsideClick);
			document.body.removeEventListener('keypress', eventHandler.closeOnEscapeKey);
		}
	},
	attributes: function() {
		switch (this.attributeName) {
		case 'contextmenu':
			eventHandler.getContextMenu(this.target);
			break;

		case 'list':
			if (this.target.hasAttribute('list')) {
				eventHandler.getDatalist(this.target);
			}
			break;

		case 'open':
			if (this.target.tagName === 'DIALOG') {
				if (this.target.hasAttribute('open')) {
					setTimeout(() => {
						$(document.body).click(eventHandler.closeOnOutsideClick).keypress(eventHandler.closeOnEscapeKey);
					}, 500);
				} else {
					document.body.removeEventListener('click', eventHandler.closeOnOutsideClick);
					document.body.removeEventListener('keypress', eventHandler.closeOnEscapeKey);
				}
			}
			break;

		case 'contenteditable':
			if (this.target.hasAttribute('contenteditable')) {
				wysiwygToggle(this.target);
			}
			break;

		case 'data-show':
			if (this.target.dataset.hasOwnProperty('show')) {
				this.target.addEventListener('click', eventHandler.dataShow);
			} else {
				this.target.removeEventListener('click', eventHandler.dataShow);
			}
			break;

		case 'data-show-modal':
			if (this.target.dataset.hasOwnProperty('showModal')) {
				this.target.addEventListener('click', eventHandler.dataShowModal);
			} else {
				this.target.removeEventListener('click', eventHandler.dataShowModal);
			}
			break;

		case 'data-close':
			if (this.target.dataset.hasOwnProperty('close')) {
				this.target.addEventListener('click', eventHandler.dataClose);
			} else {
				this.target.removeEventListener('click', eventHandler.dataClose);
			}
			break;

		case 'data-delete':
			if (this.target.dataset.hasOwnProperty('delete')) {
				this.target.addEventListener('click', eventHandler.dataDelete);
			} else {
				this.target.removeEventListener('click', eventHandler.dataDelete);
			}
			break;

		case 'data-scroll-to':
			if (this.target.dataset.hasOwnProperty('scrollTo')) {
				this.target.addEventListener('click', eventHandler.dataScrollTo);
			} else {
				this.target.removeEventListener('click', eventHandler.dataScrollTo);
			}
			break;

		case 'data-load-form':
			if (this.target.dataset.hasOwnProperty('loadForm')) {
				this.target.addEventListener('click', eventHandler.dataLoadForm);
			} else {
				this.target.removeEventListener('click', eventHandler.dataLoadForm);
			}
			break;

		case 'data-request':
			if (this.target.dataset.hasownProperty('request')) {
				this.target.addEventListener('click', eventHandler.dataRequest);
			} else {
				this.target.removeEventListener('click', eventHandler.dataRequest);
			}
			break;

		case 'data-share':
			if (this.target.dataset.hasOwnProperty('share')) {
				this.target.addEventListener('click', eventHandler.dataShare);
			} else {
				this.target.removeEventListener('click', eventHandler.dataShare);
			}
			break;

		case 'data-fullscreen':
			if (this.target.dataset.hasOwnProperty('fullscreen')) {
				this.target.addEventListener('click', fullScreen);
			} else {
				this.target.removeEventListener('click', fullScreen);
			}
			break;

		default:
			console.error(`Unhandled attribute in watch: "${this.attributeName}"`);
		}
	}
};

export const config = [
	'subtree',
	'attributeOldValue'
];

export const attributeTree = [
	'contextmenu',
	'list',
	'open',
	'contenteditable',
	'data-show',
	'data-show-modal',
	'data-close',
	'data-delete',
	'data-scroll-to',
	'data-load-form',
	'data-request',
	'data-share',
	'data-fullscreen'
];

export function bootstrap() {
	'use strict';
	this.each(function(node) {
		if (node.nodeType !== 1) {
			return this;
		}
		if (Reader.speechSupported()) {
			query('article', node).forEach(article => {
				new Reader(article, article.querySelector('article header'));
			});
		}
		if (!supports('details')) {
			query('details > summary', node).forEach(summary => {
				summary.addEventListener('click', eventHandler.toggleDetails);
			});
		}
		if (supports('menuitem')) {
			query('[contextmenu]', node).forEach(eventHandler.getContextMenu);
		}
		if (supports('datalist')) {
			query('[list]', node).forEach(eventHandler.getDatalist);
		}
		// if (!supports('picture')) {
		// 	query('picture', node).forEach(pictureShim);
		// }
		query('[autofocus]', node).forEach(input => input.focus());
		query(
			'a[href]:not([target="_blank"]):not([download]):not([href*="\#"])',
			node
		).filter(link => link.origin === location.origin).forEach(a => {
			a.addEventListener('click', eventHandler.getLink);
		});
		query('form[name]', node).filter(eventHandler.sameoriginFrom).forEach(form => {
			form.addEventListener('submit', eventHandler.submitForm);
		});
		query('[data-request]', node).forEach(el => {
			el.addEventListener('click', eventHandler.dataRequest);
		});
		query('[data-load-form]', node).forEach(el => {
			el.addEventListener('click', eventHandler.dataLoadForm);
		});
		query('[data-show]', node).forEach(el => {
			el.addEventListener('click', eventHandler.dataShow);
		});
		query('[data-show-modal]', node).forEach(el => {
			el.addEventListener('click', eventHandler.dataShowModal);
		});
		query('[data-scroll-to]', node).forEach(el => {
			el.addEventListener('click', eventHandler.dataScrollTo);
		});
		// query('[data-import]', node).forEach(el => {
		// 	el.HTMLimport();
		// });
		query('[data-close]', node).forEach(el => {
			el.addEventListener('click', eventHandler.dataClose);
		});
		query('[data-share]', node).forEach(node => {
			node.addEventListener('click', eventHandler.dataShare);
		});
		query('[data-fullscreen]', node).forEach(el => {
			el.addEventListener('click', toggleFullScreen);
		});
		query('[data-delete]', node).forEach(el => {
			el.addEventListener('click', eventHandler.dataDelete);
		});
		query('fieldset button[type="button"].toggle', node).forEach(toggle => {
			toggle.addEventListener('click', eventHandler.toggleCheckboxes);
		});
		query('[data-must-match]', node).forEach(eventHandler.matchPattern);
		// query('[data-dropzone]', node) .forEach(function (el) {
		// 	document.querySelector(el.dataset.dropzone).DnD(el);
		// });
		query('input[data-equal-input]', node).forEach(input => {
			input.addEventListener('input', eventHandler.matchInput);
		});
		query('[contenteditable]', node).forEach(el => wysiwygToggle(el));
		query('menu[type="context"]', node).forEach(wysiwyg);
		// query('[data-request]', node).forEach(el => {
		// 	el.addEventListener('click', click => {
		// 		click.preventDefault();
		// 		if (!(el.dataset.hasOwnProperty('confirm')) || confirm(el.dataset.confirm)) {
		// 			let url = new URL(el.dataset.url || document.baseURI);
		// 			let headers = new Headers();
		// 			let body = new URLSearchParams(el.dataset.request);
		// 			headers.set('Accept', 'application/json');
		// 			if ('prompt' in el.dataset) {
		// 				body.set('prompt_value', prompt(el.dataset.prompt));
		// 			}
		// 			fetch(url, {
		// 				method: 'POST',
		// 				headers,
		// 				body,
		// 				credentials: 'include'
		// 			}).then(parseResponse).then(handleJSON).catch(reportError);
		// 		}
		// 	});
		// });
		// query('[data-dropzone]', node).forEach(finput => {
		// 	document.querySelector(finput.dataset.dropzone).DnD(finput);
		// });
	});
	return this;
}
