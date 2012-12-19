fisheye
=======

JavaScript Mac-Style Fisheye-Menu

JH_Fisheye does not use any third-party libraries.
Most code is encapsulated in the two objects JH_Fisheye and JH_Fisheye_Statics.
Apart from those two objects there are two helper functions - getCookie() and setCookie() which will be defined if needed.
JH_Fisheye does make use of cookies to store state between page-loads. The reasoning behind this is that regular anchor-elements
facilitate search-engine-indexing and cookies provide for an easy way to save state at the client, while js-objects get lost between
page loads.

Example
=======
```html
<ul class="jh_fisheye" id="myFisheye">
	<li>
		<label>MyMenuItemName</label>
		<a href="whereItPointsTo">
			<img icon_src_big="pathToMaxSizeIcon" icon_src_small="pathToMinSizeIcon" src="pathToMinSizeIcon" />
		</a>
	</li>
	...
</ul>

<script>
	var myFisheye = new JH_Fisheye(document.getElementById('myFisheye'));
</script>
```

Options
=======

The JH_Fisheye can be initialized with a number of options:

- it can be made vertical by assigning the class name jh_fisheye_vertical
- you can specify a menu item to be active as the second parameter
- you can specify wether you want gutter-elements (i. e. facilitate an on-approach effect) or not (defaults to _true_)

```html
<ul class="jh_fisheye_vertical" id="myVerticalFisheye">
	<li>
		<label>MyMenuItemName</label>
		<a href="whereItPointsTo">
			<img icon_src_big="pathToMaxSizeIcon" icon_src_small="pathToMinSizeIcon" src="pathToMinSizeIcon" id="iWantThisToBeActive"/>
		</a>
	</li>
	...
</ul>

<script>
	// this will create a vertical fisheye menu, where the item 'iWantThisToBeActive' is active by default and there are no gutter-elements.
	var myFisheye = new JH_Fisheye(document.getElementById('myVerticalFisheye'), document.getElementById('iWantThisToBeActive'), false);
</script>
```

Customization
-------------

The JH_Fisheye_Statics-Object contains a number of parameters to tweak for your wishes.
Some examples are:
```js
JH_Fisheye_Statics.MIN_MENU_ICON_SIZE: 48,    // Minimum Icon Size (in px), i.e. image size in non-magnified state
JH_Fisheye_Statics.MAX_MENU_ICON_SIZE: 80,    // Maximum Icon Size (in px), i.e. image size in magnified state
JH_Fisheye_Statics.FOCUSED_ITEMS: 1, // number of items under the transfer function, 1 -> one to the left and right of the focused item, 2 -> two to the left/right,...
JH_Fisheye_Statics.VERTICAL_MARGIN: 0, // margin between icons in vertical fisheye menu
```