import delegate from 'delegate';

/**
 * @param {String} [options.hoverSrcAttribute]
 * @param {String} [options.orginalSrcAttribute]
 * @param {String} [options.classToggle]
 */
const initializeHoverImage = ({
	hoverSrcAttribute = 'data-hover-src',
	orginalSrcAttribute = 'data-original-src',
	classToggle = 'is-hovered',
	preloadHoverImages = true,
} = {}) => {
	if (!hoverSrcAttribute || !orginalSrcAttribute) {
		throw new Error(
			'Options "hoverSrcAttribute" and "orginalSrcAttribute" must be included when calling function'
		);
	}

	const selector = `[${hoverSrcAttribute}]`;
	delegate(selector, 'mouseover', e => {
		const image = e.delegateTarget;

		const original_src = image.getAttribute(orginalSrcAttribute);
		if (!original_src) {
			image.setAttribute(orginalSrcAttribute, image.src);
		}

		const hover_src = image.getAttribute(hoverSrcAttribute);
		if (hover_src) {
			image.src = hover_src;

			if (classToggle) {
				image.classList.add(classToggle);
			}
		}
	});

	delegate(selector, 'mouseout', e => {
		const image = e.delegateTarget;

		const original_src = image.getAttribute(orginalSrcAttribute);
		if (original_src) {
			image.src = original_src;
			if (classToggle) {
				image.classList.remove(classToggle);
			}
		}
	});

	if (preloadHoverImages) {
		// Find all matching images and get unique URLs from their `hoverSrcAttribute`
		const images = document.querySelectorAll(selector);
		let image_urls = {};
		for (let i = 0; i < images.length; i++) {
			const image = images[i];
			const hover_src = image.getAttribute(hoverSrcAttribute);
			image_urls[hover_src] = true;
		}

		image_urls = Object.keys(image_urls);
		image_urls.forEach(image_src => {
			// Kicks off the network request for our browser to cache for later
			new Image().src = image_src;
		});
	}
};

export default initializeHoverImage;
