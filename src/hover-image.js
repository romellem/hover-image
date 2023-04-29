import delegate from 'delegate';

/**
 * @typedef {Object} HoverImageOptions
 * @property {String} [hoverSrcAttribute] The data attribute the library will attach its delegated events to.
 * @property {String} [orginalSrcAttribute] Deprecated, use `originalSrcAttribute` instead.
 * @property {String} [originalSrcAttribute] The name of the data attribute the library will save the original source URL while the image is swapped out.
 * @property {String} [hoverImageSelectorAttribute] When the `hoverSrcAttribute` is placed on a non-image element, this optional attribute allows for a selector to be passed for the child image that'll be swapped out. When this attribute is not present, its value defaults to 'img'.
 * @property {String} [classToggle] The class that will get toggled while the image is swapped out on hover.
 * @property {Boolean} [preloadHoverImages] When true, will make a network request for all images specified within the `hoverSrcAttribute` before the initial `mouseover` event has fired.
 */

/**
 * @param {HoverImageOptions} [options] The data attribute the library will attach its delegated events to.
 * @returns {() => void} Returns a method to destroy the event listeners we placed.
 */
const initializeHoverImage = ({
	hoverSrcAttribute = 'data-hover-src',
	orginalSrcAttribute,
	originalSrcAttribute = 'data-original-src',
	hoverImageSelectorAttribute = 'data-image-selector',
	classToggle = 'is-hovered',
	preloadHoverImages = true,
} = {}) => {
	// Can't believe I never noticed this typo before...
	if (orginalSrcAttribute) {
		originalSrcAttribute = orginalSrcAttribute;
	}

	if (!hoverSrcAttribute || !originalSrcAttribute) {
		throw new Error(
			'Options "hoverSrcAttribute" and "originalSrcAttribute" must be included when calling function'
		);
	}

	const selector = `[${hoverSrcAttribute}]`;

	function mouseoverHandler(e) {
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

		const original_src = image.getAttribute(originalSrcAttribute);
		if (!original_src) {
			image.setAttribute(originalSrcAttribute, image.src);
		}

		// Change our image's `src` attribute to the hover source
		image.src = hover_src;

		if (classToggle) {
			target.classList.add(classToggle);
		}
	}

	function mouseoutHandler(e) {
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

		const original_src = image.getAttribute(originalSrcAttribute);
		if (!original_src || image.src === original_src) {
			return;
		}

		// Change our image's `src` attribute back to its original source
		image.src = original_src;

		if (classToggle) {
			image.classList.remove(classToggle);
		}
	}

	const mouseoverListener = delegate(selector, 'mouseover', mouseoverHandler);
	const focusListener = delegate(selector, 'focus', mouseoverHandler);
	const mouseoutListener = delegate(selector, 'mouseout', mouseoutHandler);
	const blurListener = delegate(selector, 'blur', mouseoutHandler);

	if (preloadHoverImages) {
		// Find all matching images and get unique URLs from their `hoverSrcAttribute`
		const images = document.querySelectorAll(selector);
		let image_urls = {};
		for (let i = 0; i < images.length; i++) {
			const image = images[i];
			const hover_src = image.getAttribute(hoverSrcAttribute);
			if (!image_urls[hover_src]) {
				// Kicks off the network request for our browser to cache for later
				new Image().src = hover_src;
			}

			image_urls[hover_src] = true;
		}
	}

	return function destroy() {
		mouseoverListener.destroy();
		focusListener.destroy();
		mouseoutListener.destroy();
		blurListener.destroy();
	};
};

export default initializeHoverImage;
