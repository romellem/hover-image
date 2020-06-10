# Hover Image

A generic library to swap out an image on hover.

<img src="https://raw.githubusercontent.com/Designory/hover-image/master/docs/dog.gif" width="250">

[Photos by Daniel Brubaker on Unsplash](https://unsplash.com/@dpmb87?utm_medium=referral)

## Install

```
$ npm install @designory/hover-image
# or
$ yarn global add @designory/hover-image
```

## Usage

Place your configured `hoverSrcAttribute` (which defaults to `data-hover-src`)
on an `<img>` tag.

```html
<img src="original.jpg" data-hover-src="hover.jpg">
```

If you place the attribute on a tag that isn't an `<img>`, then we search for the first child `<img>` tag to have its source swapped.

```html
<a href="#" data-hover-src="hover.png">
    <img src="original.png">
    When you hover over this link, the icon will change.
</a>
```

The child image is found using `querySelector`, which uses a ["depth-first pre-order traversal"](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector) of the child nodes. If you have many child image nodes, and you don't want the first one, you can also put an additional data attribute to specify a selector.

This data attribute is configured by the [`hoverImageSelectorAttribute`](#hoverimageselectorattribute) option, and defaults to `'data-image-selector'`.

```html
<a href="#" data-hover-src="hover.png" data-image-selector=".will-be-changed">
    <img src="remains-unchanged.png">
    When you hover over this link, the icon on the left will remain the same, the icon to the <em>right</em> instead will change.
    <img src="original.png" class="will-be-changed">
</a>
```

Once your HTML is configured, you need to initialize the mouse event listeners:

```javascript
import initializeHoverImage from '@designory/hover-image';
// Or, if non-transpiled:
// const initializeHoverImage = require('@designory/hover-image').default;

initializeHoverImage({
    hoverSrcAttribute,
    orginalSrcAttribute,
    hoverImageSelectorAttribute,
    classToggle,
    preloadHoverImages,
});
```

The initialize function returns a `destroy` function if you need to remove
the event listeners that get added:

```javascript
let destroyHoverListeners = initializeHoverImage();

destroyHoverListeners();
```

### Options

#### `hoverSrcAttribute`

The data attribute the library will attach its delegated events to.

This can be placed on any element, not just on an `<img>` tag. If this is placed on a non-image tag, then we look for the first child `<img>` of that element. If you need to target a child element other than the first matching `img`, then see the [`hoverImageSelectorAttribute`](#hoverimageselectorattribute) option for more information on how to pass a custom selector.

Defaults to `'data-hover-src'`.

#### `orginalSrcAttribute`

The name of the data attribute the library will save the original source URL while the image is swapped out.

Defaults to `'data-original-src'`.

#### `hoverImageSelectorAttribute`

When the `hoverSrcAttribute` is placed on a non-image element, this optional attribute allows for a selector to be passed for the child image that'll be swapped out. When this attribute is not present, the selector it uses is `'img'`.

Defaults to `'data-image-selector'`.

#### `classToggle`

The class that will get toggled while the image is swapped out on hover.

Defaults to `'is-hovered'`.

#### `preloadHoverImages`

When true, will make a network request for all images specified within the `hoverSrcAttribute` before the initial `mouseover` event has fired. If the browser is caching network requests, this should help eliminate the slight empty flash the user sees when hovering over the image for the first time.

Defaults to `true`.

## Browser Support

* Internet Explorer (IE) 10
* All modern browsers

## License

[MIT](./LICENSE)

## Author

[Matt Wade](https://github.com/romellem/)
