import delegate from 'delegate';

/**
 * @param {String} [options.hoverSrcAttribute] The data attribute the library will attach its delegated events to.
 * @param {String} [options.orginalSrcAttribute] The name of the data attribute the library will save the original source URL while the image is swapped out.
 * @param {String} [options.hoverImageSelectorAttribute] When the `hoverSrcAttribute` is placed on a non-image element, this optional attribute allows for a selector to be passed for the child image that'll be swapped out. When this attribute is not present, its value defaults to 'img'.
 * @param {String} [options.classToggle] The class that will get toggled while the image is swapped out on hover.
 * @param {Boolean} [options.preloadHoverImages] When true, will make a network request for all images specified within the `hoverSrcAttribute` before the initial `mouseover` event has fired.
 * @returns {Function} Returns a method to destroy the event listeners we placed.
 */
const initializeHoverImage = ({
	hoverSrcAttribute = 'data-hover-src',
	orginalSrcAttribute = 'data-original-src',
	hoverImageSelectorAttribute = 'data-image-selector',
	classToggle = 'is-hovered',
	preloadHoverImages = true,
} = {}) => {
	if (!hoverSrcAttribute || !orginalSrcAttribute) {
		throw new Error(
			'Options "hoverSrcAttribute" and "orginalSrcAttribute" must be included when calling function'
		);
	}

	const selector = `[${hoverSrcAttribute}]`;
	const mouseover = delegate(selector, 'mouseover', e => {
		let target = e.delegateTarget;
		let image = target;

		if (image.tagName !== 'IMG') {
			// Defaults to looking for the first `<img>` tag in querySelector's depth-first search
			let image_selector = 'img';
			if (target.hasAttribute(hoverImageSelectorAttribute)) {
				image_selector = target.getAttribute(hoverImageSelectorAttribute);
			}

			image = target.querySelector(image_selector);
			if (!image) {
				return;
			}
		}

		let previous_hover_node = e.relatedTarget;
		if (target.contains(previous_hover_node)) {
			return;
		}

		const hover_src = target.getAttribute(hoverSrcAttribute);
		if (!hover_src || hover_src === image.src) {
			return;
		}

		const original_src = image.getAttribute(orginalSrcAttribute);
		if (!original_src) {
			image.setAttribute(orginalSrcAttribute, image.src);
		}

		// Change our image's `src` attribute to the hover source
		image.src = hover_src;

		if (classToggle) {
			target.classList.add(classToggle);
		}
	});

	const mouseout = delegate(selector, 'mouseout', e => {
		let target = e.delegateTarget;
		let image = target;

		if (image.tagName !== 'IMG') {
			let image_selector = 'img';
			if (target.hasAttribute(hoverImageSelectorAttribute)) {
				image_selector = target.getAttribute(hoverImageSelectorAttribute);
			}

			image = target.querySelector(image_selector);
			if (!image) {
				return;
			}
		}

		let previous_hover_node = e.relatedTarget;
		if (target.contains(previous_hover_node)) {
			return;
		}

		const original_src = image.getAttribute(orginalSrcAttribute);
		if (!original_src || image.src === original_src) {
			return;
		}

		// Change our image's `src` attribute back to its original source
		image.src = original_src;

		if (classToggle) {
			image.classList.remove(classToggle);
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

	return function destroy() {
		mouseover.destroy();
		mouseout.destroy();
	};
};

export default initializeHoverImage;
