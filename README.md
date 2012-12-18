fisheye
=======

JavaScript Mac-Style Fisheye-Menu

JH_Fisheye does not use any third-party libraries.
Most code is encapsulated in the two objects JH_Fisheye and JH_Fisheye_Statics.
Apart from those two objects there are two helper functions - getCookie() and setCookie() which will be defined if needed.

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
	var myFisheye = new JH_Fisheye(document.getElementById('myFisheye');
</script>
```