/**
 * JH_FISHEYE.JS
 * Copyright 2012 J&H.
 * 
 * - JH Fisheye Menu -
 * 
 * HTML-Example:
 * <ul class="jh_fisheye" id="myFisheye">
 *  <li>
 * 		<label>
 * 		</label>
 *      <a>
 *          <img icon_src_big="<pathToMaxSizeIcon>" icon_src_small="<pathToMinSizeIcon>"/>
 *      <a>
 *  </li>
 * ...
 * </ul>
 * 
 * Javascript-Example:
 * <script>
 * 	var myFisheye = new JH_Fisheye(document.getElementById('myFisheye'));
 * </script>
 * 
 */

if(typeof(setCookie) === 'undefined'){
    /**
     * Sets a cookie
     * @param {String} cName the cookie's name
     * @param {String} value the cookie's value
     * @param {int} exDays the number of days until expiration
     */
    function setCookie(cName, value, exDays, path) {
        exDays = exDays !== null && exDays !== undefined ? exDays : 0;
        path = path !== null && path !== undefined ? path : '/';
        var cValue = escape(value) + "; path=" + path;
        if (exDays > 0) {
            var exDate = new Date();
            exDate.setDate(exDate.getDate() + exDays);
            cValue += "expires=" + exDate.toUTCString() + ";";
        }
        document.cookie = cName + "=" + cValue;
    }
}

if(typeof(getCookie) === 'undefined'){
    /**
     * Retrieves a cookie
     * @param {String} cName the name of the cookie
     * @return {String} the cookie's value if existent, null otherwise
     */
    function getCookie(cName) {
        var cookies = document.cookie.split(";");
        var key;
        var value;
        for (var i = 0; i < cookies.length; i++) {
            key = cookies[i].substr(0, cookies[i].indexOf("="));
            value = cookies[i].substr(cookies[i].indexOf("=") + 1);
            key = key.replace(/^\s+|\s+$/g, "");
            if (key === cName) {
                return unescape(value);
            }
        }
        return null;
    }
}


/**
 * JH_Fisheye helper object containing static variables and functions
 */
var JH_Fisheye_Statics = {
	MIN_MENU_ICON_SIZE: 48,    // Minimum Icon Size, i.e. image size in non-magnified state
	MAX_MENU_ICON_SIZE: 80,    // Maximum Icon Size, i.e. image size in magnified state
	MENU_CLASS_NAME: 'jh_fisheye_menu',    // JH Fisheye class name, i.e. class of the fisheye-<ul> 
	VERTICAL_MENU_CLASS_NAME: 'jh_fisheye_menu_vertical',  // JH Fisheye class name for vertical fisheye menus
	COOKIE_KEY_ACTIVE: 'jh_fisheye_menu_active_item',  // Name of the cookie containing the active item index
	COOKIE_KEY_OFFSET: 'jh_fisheye_menu_offsetX',  // Name of the cookie containing the current offset
	ICON_SRC_BIG: 'icon_src_big',  // attribute name for maximum size icon image src
	ICON_SRC_SMALL: 'icon_src_small', // attribute name for minimum size icon image src
	FOCUSED_ITEMS: 1, // number of items under the transfer function, 1 -> one to the left and right of the focused item, 2 -> two to the left/right,...
	VERTICAL_MARGIN: 0, // margin between icons in vertical fisheye menu
	isGutter: function(icon){ // checks if the given item is a gutter item or not
		return !(icon.getAttribute("gutter") === null || icon.getAttribute("gutter") === undefined);
	},
	transfer: function(x){ // Fisheye transfer function
	    var y = 0.5 * (Math.cos(x * 3) + 1); 
		return parseFloat(y.toFixed(2));
	},
	isActive: function(icon){ // checks if the given item is active, i.e. was clicked
		return icon.getAttribute('active') === 'true';
	} 
};

/**
 * JH-Fisheye-Object
 * @param {<ul>} rootULElement the HTML-<ul>-Element this JH_Fisheye works on
 * @param {<img>} activeElement the HTML-<img>-Element to be active by default when this JH_Fisheye is initialized.[optional]
 */
JH_Fisheye = function(rootULElement, activeElement){
	if(rootULElement.getAttribute("JH_Fisheye_Initialized") !== null && rootULElement.getAttribute("JH_Fisheye_Initialized") !== undefined){
		return;
	}
	this.menuItemIcons = [];
	this.menuItemSizes = [];
	this.menuItemLabels = [];
	this.rootUL = rootULElement;
	this.updateInProgress = false;
	this.menuIconDelta = JH_Fisheye_Statics.MAX_MENU_ICON_SIZE - JH_Fisheye_Statics.MIN_MENU_ICON_SIZE;
	this.timeout = null;
	/**
	 * Checks if the fisheye menu is oriented vertical
	 */
	this.isVertical = function(){
		return rootULElement.className.contains('jh_fisheye_menu_vertical');
	};
	/**
	 * Sets the active item
	 * @param {img-Element} item the item to activate
	 */
	this.setActive = function(item){
		// find the icon
		for(var i = 0; i < this.menuItemIcons.length; i++){
			if(this.menuItemIcons[i] === item){
				this.menuItemIcons[i].setAttribute('active', 'true');
				// store active element in cookie
				setCookie(JH_Fisheye_Statics.COOKIE_KEY_ACTIVE + "_" + this.rootUL.id, this.menuItemIcons[i].id, 0);
			} else {
				this.menuItemIcons[i].setAttribute('active', 'false');
				this.menuItemLabels[i].style.visibility = "hidden";
			}
		}
	};
	/**
	 * Helper function to autonomously activate arbitrary items
	 */
	this.activate = function(item){
	    this.setActive(item);
        this.renderMouseMove(JH_Fisheye_Statics.MIN_MENU_ICON_SIZE/2, item);   
	};
	/**
	 * Handles click events on menuItems
	 * @param {event} e the event-object
	 */
	this.clicked = function(e){
		// get the event object if not provided
		if(!e){
			e = window.event;
		}
		window.event = e;
		var target = e.target || e.srcElement;
		// determine target element's index
		var index = 0;
		while(this.menuItemIcons[index] !== target){
			index++;
		}
		this.setActive(this.menuItemIcons[index]);
		setCookie(JH_Fisheye_Statics.COOKIE_KEY_OFFSET + "_" + this.rootUL.id, e.offsetX, 0);
		// force rerendering of the icons
		this.mouseOverIcons(e);
	};
	/**
	 * Renders mousemove-animation
	 * @param {int} offsetX the x-offset within the target element
	 * @param {<img>} target the target HTML-<img>-Element that triggered the event
	 */
	this.renderMouseMove = function(offsetX, target){
		// determine target element's index
		var targetIndex = 0;
		while(this.menuItemIcons[targetIndex] !== target){
			targetIndex++;
		}
		var deltaX = offsetX / (this.menuItemSizes[targetIndex]);
		var icon;
		for(var i = 0; i < this.menuItemIcons.length; i++){
			icon = this.menuItemIcons[i];
			if(i === targetIndex && !JH_Fisheye_Statics.isGutter(icon)){ // focused icon
				this.menuItemLabels[i].style.visibility = 'visible';
				icon.setAttribute('width',  JH_Fisheye_Statics.MAX_MENU_ICON_SIZE + "px");
				icon.setAttribute('height', JH_Fisheye_Statics.MAX_MENU_ICON_SIZE + "px");
				// reset image src if possible
				if(icon.getAttribute(JH_Fisheye_Statics.ICON_SRC_BIG)){
				    icon.setAttribute('src', icon.getAttribute(JH_Fisheye_Statics.ICON_SRC_BIG));
				}
				this.menuItemSizes[i] = JH_Fisheye_Statics.MAX_MENU_ICON_SIZE;
				if(this.isVertical()){
					icon.style.left = 0;
				}
				continue;
			}
			// focus area
			else if((i === targetIndex - JH_Fisheye_Statics.FOCUSED_ITEMS || i === targetIndex + JH_Fisheye_Statics.FOCUSED_ITEMS) && 
					!JH_Fisheye_Statics.isGutter(icon) && 
					!JH_Fisheye_Statics.isActive(icon)){
				var transfer = i < targetIndex ? JH_Fisheye_Statics.transfer(deltaX) : JH_Fisheye_Statics.transfer(1 - deltaX);
				var newSize =  (1 + transfer * this.menuIconDelta) + JH_Fisheye_Statics.MIN_MENU_ICON_SIZE;
				newSize = parseFloat(newSize.toFixed(2));
				// reset image src if possible and necessary
				if((newSize > JH_Fisheye_Statics.MIN_MENU_ICON_SIZE + this.menuIconDelta/2) && icon.getAttribute(JH_Fisheye_Statics.ICON_SRC_BIG)){
				    icon.setAttribute('src', icon.getAttribute(JH_Fisheye_Statics.ICON_SRC_BIG));
				} else if((newSize < JH_Fisheye_Statics.MIN_MENU_ICON_SIZE + this.menuIconDelta/2) && icon.getAttribute(JH_Fisheye_Statics.ICON_SRC_SMALL)){
				    icon.setAttribute('src', icon.getAttribute(JH_Fisheye_Statics.ICON_SRC_SMALL));
				}
				icon.setAttribute('width', newSize + "px");
				icon.setAttribute('height', newSize + "px");
				this.menuItemSizes[i] = newSize;
				if(this.isVertical()){
					icon.style.left = ((JH_Fisheye_Statics.MAX_MENU_ICON_SIZE - newSize) / 2) + "px";
				}
				continue;
			}	
			// else reset it's size
			else if(!JH_Fisheye_Statics.isGutter(icon) && !JH_Fisheye_Statics.isActive(icon)){
			    // reset image src if possible
			    if(icon.getAttribute(JH_Fisheye_Statics.ICON_SRC_SMALL)){
			        icon.setAttribute('src', icon.getAttribute(JH_Fisheye_Statics.ICON_SRC_SMALL));
			    }
				icon.setAttribute('width', JH_Fisheye_Statics.MIN_MENU_ICON_SIZE + "px");
				icon.setAttribute('height', JH_Fisheye_Statics.MIN_MENU_ICON_SIZE + "px");
				this.menuItemSizes[i] = JH_Fisheye_Statics.MIN_MENU_ICON_SIZE;
				if(this.isVertical()){
					icon.style.left = ((JH_Fisheye_Statics.MAX_MENU_ICON_SIZE - newSize) / 2) + "px";
				}
				continue;
			}
		}
	};
	/**
	 * Handles mouseout events on menuItems
	 * @param {event} e the event-object
	 */
	this.mouseOut = function(e){
		if(this.updateInProgess){
			return;
		}
		var newSize;
		var timeoutNeeded = false;
		for(var i = 0; i < this.menuItemIcons.length; i++){
			if((this.menuItemSizes[i] > JH_Fisheye_Statics.MIN_MENU_ICON_SIZE)	 
				&& !JH_Fisheye_Statics.isGutter(this.menuItemIcons[i]) 
				&& !JH_Fisheye_Statics.isActive(this.menuItemIcons[i])){
				newSize = this.menuItemSizes[i] - 2 > JH_Fisheye_Statics.MIN_MENU_ICON_SIZE ? this.menuItemSizes[i] - 2 : JH_Fisheye_Statics.MIN_MENU_ICON_SIZE;
				// check if we need to continue decreasing it's size
				if(newSize > JH_Fisheye_Statics.MIN_MENU_ICON_SIZE){
					timeoutNeeded = true;
				}
				// adjust image src if possible and neccessary
				if((newSize > JH_Fisheye_Statics.MIN_MENU_ICON_SIZE + this.menuIconDelta/2) && icon.getAttribute(JH_Fisheye_Statics.ICON_SRC_BIG)){
                    icon.setAttribute('src', icon.getAttribute(JH_Fisheye_Statics.ICON_SRC_BIG));
                } else if((newSize < JH_Fisheye_Statics.MIN_MENU_ICON_SIZE + this.menuIconDelta/2) && icon.getAttribute(JH_Fisheye_Statics.ICON_SRC_SMALL)){
                    icon.setAttribute('src', icon.getAttribute(JH_Fisheye_Statics.ICON_SRC_SMALL));
                }
				this.menuItemIcons[i].setAttribute("width", newSize + "px");
				this.menuItemIcons[i].setAttribute("height", newSize + "px");
				if(this.isVertical()){
					this.menuItemIcons[i].style.left = ((JH_Fisheye_Statics.MAX_MENU_ICON_SIZE - newSize) / 2) + "px";
				}
				this.menuItemSizes[i] = newSize;
				this.menuItemLabels[i].style.visibility = 'hidden';
			}
		}
		if(timeoutNeeded){
		    var self = this;
			this.timeout = window.setTimeout(function(e){ self.mouseOut(e); }, 30);	
		}
	};
	/**
	 * Handles mouseover events on menuItems
	 * @param {event} e the event object
	 */
	this.mouseOverIcons = function(e){
		if(this.updateInProgress){
			return;
		} else {
			this.updateInProgress = true;
		}
		if(this.timeout !== null && this.timeout !== undefined){
			window.clearTimeout(this.timeout);
			this.timeout = null;
		}
		// get the event object if not provided
		if(!e){
			e = window.event;
		}
		var target = e.target || e.srcElement;
		
		var offset = this.isVertical() ? e.offsetY || e.layerY : e.offsetX || e.layerX;
		this.renderMouseMove(offset, target);
		this.updateInProgress = false;
	};
	// create gutter elements
	var gutterElementStart = document.createElement("li");
	var gutterImageStart = document.createElement("img");
	var gutterLabelStart = document.createElement('label');
	gutterElementStart.className = 'jh_fisheye_gutter';
	gutterLabelStart.innerHTML = 'gutter';
	gutterImageStart.setAttribute("src", "/img/fisheye_gutter.png");
	gutterImageStart.setAttribute("gutter", "true");
	gutterElementStart.appendChild(gutterImageStart);
	gutterElementStart.appendChild(gutterLabelStart);
	var gutterElementEnd = document.createElement("li");
	var gutterImageEnd = document.createElement("img");
	var gutterLabelEnd = document.createElement('label');
	gutterLabelEnd.innerHTML = 'gutter';
	gutterElementEnd.className = 'jh_fisheye_gutter';
	gutterImageEnd.setAttribute("src", "/img/fisheye_gutter.png");
	gutterImageEnd.setAttribute("gutter", "true");
	gutterElementEnd.appendChild(gutterImageEnd);
	gutterElementEnd.appendChild(gutterLabelEnd);
	this.rootUL.insertBefore(gutterElementStart, rootULElement.firstChild);
	this.rootUL.appendChild(gutterElementEnd);
	// gather menu items
	var listItems = this.rootUL.getElementsByTagName('li');
	var icon;
	var label;
	var self = this;
	for(var i = 0; i < listItems.length; i++){
		// process only direct children
		if(listItems[i].parentNode !== rootULElement){
			continue;
		}
		if(this.isVertical()){
			listItems[i].style.marginBottom = JH_Fisheye_Statics.VERTICAL_MARGIN + "px";
		}
		icon = listItems[i].getElementsByTagName('img')[0];
		label = listItems[i].getElementsByTagName('label')[0];
		this.menuItemIcons.push(icon);
		this.menuItemLabels.push(label);
		// set sizes
		if(!JH_Fisheye_Statics.isGutter(icon)){
			this.menuItemSizes.push(JH_Fisheye_Statics.MIN_MENU_ICON_SIZE);
			icon.setAttribute("width", JH_Fisheye_Statics.MIN_MENU_ICON_SIZE + "px");
			icon.setAttribute("height", JH_Fisheye_Statics.MIN_MENU_ICON_SIZE + "px");
			// center the icon if it is a vertical menu
			if(this.isVertical()){
				icon.style.left = this.menuIconDelta / 2 + "px";
			}
		} else {
			// gutter elements are initialized to max size
			this.menuItemSizes.push(JH_Fisheye_Statics.MAX_MENU_ICON_SIZE);
			icon.setAttribute("width", JH_Fisheye_Statics.MAX_MENU_ICON_SIZE + "px");
			icon.setAttribute("height", JH_Fisheye_Statics.MAX_MENU_ICON_SIZE + "px");
		}
		// event handlers
		if(icon.addEventListener){
			icon.addEventListener('mousemove', function(e){ self.mouseOverIcons(e); }, false);
			icon.addEventListener('mouseout', function(e){ self.mouseOut(e); }, false);
			icon.addEventListener('click', function(e){ self.clicked(e); }, false);
		} else if (icon.attachEvent){
			icon.attachEvent('onmousemove', function(e){ self.mouseOverIcons(e); });
			icon.attachEvent('onmouseout', function(e){ self.mouseOut(e); });
			icon.attachEvent('onclick', function(e){ self.clicked(e); });
		}
		icon.style.position = 'relative';
	}
	// check for active item
	if(activeElement !== null && activeElement !== undefined){
		this.activate(activeElement);
	} else if(getCookie(JH_Fisheye_Statics.COOKIE_KEY_ACTIVE + "_" + this.rootUL.id) !== null){
		this.setActive(document.getElementById(getCookie(JH_Fisheye_Statics.COOKIE_KEY_ACTIVE + "_" + this.rootUL.id)));
		this.renderMouseMove(getCookie(JH_Fisheye_Statics.COOKIE_KEY_OFFSET + "_" + this.rootUL.id), document.getElementById(getCookie(JH_Fisheye_Statics.COOKIE_KEY_ACTIVE + "_" + this.rootUL.id)));
	}
	// setup minimum dimensions
	var dimensions = this.getMaxDimensions();
	if(Number(this.rootUL.style.minWidth) < dimensions.width){
	   this.rootUL.style.minWidth = dimensions.width + "px";
	}
	if(Number(this.rootUL.style.minHeight) < dimensions.height){
	   this.rootUL.style.minHeight = dimensions.height + "px";
	}
	// prevent from initializing twice
	rootULElement.setAttribute("JH_Fisheye_Initialized", "True");
};
/**
 * Returns the maximum dimensions the jh_fisheye occupies
 * @return {Object} an object with attributes width and height (in px) representing the maximal dimensions this fisheye might occupy
 */
JH_Fisheye.prototype.getMaxDimensions = function(){
	var labelHeight = this.menuItemLabels[0].clientHeight;
	if(this.isVertical()){
		return {
			width: JH_Fisheye_Statics.MAX_MENU_ICON_SIZE,
			height: (this.menuItemIcons.length * (JH_Fisheye_Statics.MAX_MENU_ICON_SIZE + labelHeight + JH_Fisheye_Statics.VERTICAL_MARGIN))
		};	
	} else {
		return {
			width: (this.menuItemIcons.length * JH_Fisheye_Statics.MAX_MENU_ICON_SIZE),
			height: (JH_Fisheye_Statics.MAX_MENU_ICON_SIZE + labelHeight)
		};
	}
};
/**
 * Returns the active item's id
 * @return {String} the id of the active menu item if any, null otherwise
 */
JH_Fisheye.prototype.getActiveItemId = function(){
    for(var i = 0; i < this.menuItemIcons.length; i++){
        if(this.menuItemIcons[i].getAttribute('active') === 'true'){
            return this.menuItemIcons[i].id;
        }
    }
    return null;
}
