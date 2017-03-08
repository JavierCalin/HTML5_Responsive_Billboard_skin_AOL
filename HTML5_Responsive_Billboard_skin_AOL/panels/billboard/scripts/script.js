/*******************
 VARIABLES
*******************/
	var creativeVersion = "1.0.0";	// format versioning code, please do not alter or remove this variable
	var customJSVersion = null;		// format versioning code, please do not alter or remove this variable 
	var closeButton;
	var userActionButton;
	var clickthroughButton;
	var useSingleCreative = false;
	var isAndroid2 = (/android 2/i).test(navigator.userAgent);
	var android2ResizeTimeout;
	var snapPoints = [0, 754, 970, 1272];
	window.addEventListener("load", checkIfEBInitialized);
	window.addEventListener("message", onMessageReceived);
	window.addEventListener("resize",setColumn);
	
/*******************
 INITIALIZATION
*******************/
	function checkIfEBInitialized(event) 
	{
		if (EB.isInitialized()) initializeCreative();
		else EB.addEventListener(EBG.EventName.EB_INITIALIZED, initializeCreative);
		setColumn();
		setTimeout(function(){ setColumn();}, 500); 
	}
	
	function initializeCreative(event) 
	{
		initCustomVars();
		initializeGlobalVariables();
		addEventListeners();
		trackVideoInteractions();
		initExpandAnimation();		
		setCreativeVersion();		// format versioning code, please do not alter or remove this function
		closeButton.style.display="none";
		setColumn();
		setTimeout(function(){ setColumn();}, 500); 
	}

	function initExpandAnimation(){
		var params 					= params || {};
		params.eventName 			= 'INIT_PANEL_EXPANSION';
		params.panelName 			= EB._adConfig.mdBillboardPanelName;
		EB._sendMessage('dispatchCustomScriptEvent', params);
	}

	function initializeGlobalVariables() 
	{
		closeButton = document.getElementById("close-button");
		video = document.getElementById("video");
		userActionButton = document.getElementById("user-action-button");
		clickthroughButton = document.getElementById("clickthrough-button");
	}
	
	function addEventListeners() 
	{
		userActionButton.addEventListener("click", userAction);
		clickthroughButton.addEventListener("click", clickthrough);
		closeButton.addEventListener("click", collapse);
	}

	function removeEventListeners() 
	{
		userActionButton.removeEventListener("click", userAction);
		clickthroughButton.removeEventListener("click", clickthrough);
		closeButton.removeEventListener("click", collapse);
	}

	function initCustomVars() 
	{
		
	}
	
	function checkCloseEnabled()
	{
		if(!EB._adConfig.mdCloseButtonShow){
			closeButton.style.display="none";
		} else {closeButton.style.display="block";}
	}

	function checkIfVisibleOnLoad() {
		if (isFirstExpansion()) {
			if (isAdVisible()) {
				EB.automaticEventCounter("Billboard_Load");	
			}
			else {
				window.addEventListener("resize", checkIfVisible);
			}
		}
	}

	function checkIfVisible(event) {
		if (isAdVisible()) {
			EB.automaticEventCounter("Ad_Resize_AdShown");
			window.removeEventListener("resize", checkIfVisible);
		}
	}

	function isAdVisible() {
		return window.innerWidth > 0 && window.innerHeight > 0;
	}

	function isFirstExpansion() {
		return EB._adConfig && EB._adConfig.customJSVars && EB._adConfig.customJSVars.mdIsFirstExpand;
	}

/*******************
 EVENT HANDLERS
*******************/

	function userAction(event) 
	{
		EB.userActionCounter("UserAction");
	}
	
	function clickthrough(event) 
	{
		pauseVideos();
		EB.clickthrough();
	}
	
	function expand(event) 
	{
		EB.expand();
	}
		
	function collapse(event) 
	{
		pauseVideos();
		var params 					= params || {};
		params.eventName 			= 'COLLAPSE_BILLBOARD';
		params.panelName 			= EB._adConfig.mdBillboardPanelName;
		EB._sendMessage('dispatchCustomScriptEvent', params);
	}

	function collapseCompletely(){
		EB.collapse({
			panelName: EB._adConfig.mdBillboardPanelName,
			actionType: EBG.ActionType.USER
		});
	}

	function onMessageReceived(event) 
	{
		EBG.log.debug("event: "+event);
		try {
			var messageData = JSON.parse(event.data);
		
			if (messageData.adId && messageData.adId === getAdID()) 
			{
				switch(messageData.type && messageData.type) {
				    case "resize":
				        if (isAndroid2) android2OnResizeHandler();
				        break;
				    case "EXPAND_ANIM_START":
				        break;
				    case "COLLAPSE_ANIM_START":
				        closeButton.style.display="none";
				        break;
				    case "EXPAND_ANIM_COMPLETE":
				        checkCloseEnabled();
				        checkIfVisibleOnLoad();
				        break;
				    case "COLLAPSE_ANIM_COMPLETE":
				        collapseCompletely();
				        break;
				    default:
 				}

			}
		} 
		catch (error) {
			EBG.log.debug(error);
		}
	}

/*******************
 UTILITIES
*******************/

	function getAdID() 
	{
		if (EB._isLocalMode) return null;
		else return EB._adConfig.adId;
	}

	function setCustomVar(customVarName, defaultValue, parseNum) {	//create global var with name = str, taking value from adConfig if it's there, else use default
		var value = defaultValue;
		if(!EB._isLocalMode)
		{
			var value = EB._adConfig.hasOwnProperty(customVarName) ? EB._adConfig[customVarName] : defaultValue;
		}
		if (arguments.length == 3 && parseNum && typeof value === "string")
		{
			value = parseFloat(value);
		} 
		window[customVarName] = value;
	}
	
	function getVideos() 
	{
		var videos = document.getElementsByTagName("video");
		return videos;
	}
	
	function trackVideoInteractions() 
	{
		var videos = getVideos();
		for (var i = 0; i < videos.length; i++) 
		{
			var videoTrackingModule = new EBG.VideoModule(videos[i]);
		}
	}
	
	function pauseVideos() 
	{
		var videos = getVideos();
		for (var i = 0; i < videos.length; i++) 
		{
			videos[i].pause();
		}
	}
	
	function android2OnResizeHandler() 
	{
		document.body.style.opacity = 0.99
		clearTimeout(android2ResizeTimeout);
		
		android2ResizeTimeout = setTimeout(function() {
			document.body.style.opacity = 1;
			document.body.style.height = window.innerHeight;
			document.body.style.width = window.innerWidth;
		}, 200);
	}

	function setColumn()
	{
		if(useSingleCreative)
		{
			setSingleColumn()
		}
		else
		{
			setAllColumns()
		}
	}
	
	function setSingleColumn()
	{
		// Refer the maximum creative dimension to use scale down for the entire dimensions for responsive feather. 
		//For example if maximum creative dimension is 970x250. 
		document.getElementById('ad_content').style.width = "970px";
		document.getElementById('ad_content').style.height = "250px";

		//After removing two pixels from width and height which is used for boder, dimension remains is 968x248. Use this dimension in the belo calulation function.
		
		var scaleRatioW = calculateAspectRatioFit(968, 248, document.getElementById('column').clientWidth, document.getElementById('column').clientHeight);

		document.getElementById('ad_content').style.webkitTransform = 'scale('+scaleRatioW.ratio+')';
		document.getElementById('ad_content').style.MozTransform = 'scale('+scaleRatioW.ratio+')';
		document.getElementById('ad_content').style.msTransform = 'scale('+scaleRatioW.ratio+')';
		document.getElementById('ad_content').style.OTransform = 'scale('+scaleRatioW.ratio+')';
		document.getElementById('ad_content').style.transform = 'scale('+scaleRatioW.ratio+')';
		
		document.getElementById('ad_content').style.webkitTransformOrigin = '0 0';
		document.getElementById('ad_content').style.MozTransformOrigin = '0 0';
		document.getElementById('ad_content').style.msTransformOrigin = '0 0';
		document.getElementById('ad_content').style.OTransformOrigin = '0 0';
		document.getElementById('ad_content').style.transformOrigin = '0 0';
	}
	
	function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) 
	{
		var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
		return { ratio:ratio };
	}

	function setAllColumns()
	{
		setCurrentColumn(getEnumeratedPanelMetricsIndex());
	}

	function setCurrentColumn(n)
	{
		for (var i = 1; i < snapPoints.length; i++)
		{
			document.getElementById(("column")+i).style.display="none";
		};
		try
		{
			document.getElementById(("column")+n).style.display="block";
		}
		catch(error)
		{}	
	}

	function getEnumeratedPanelMetricsIndex() 
	{
      var w = document.getElementById("billboard").offsetWidth;;
        for (var i = 2; i < snapPoints.length; i++) 
        {
            if (w < snapPoints[i]) break;
        }
        return (i - 1);
    }

	/* versioning display function starts, you may remove these functions from your product */

	function displayVersion(version)
	{
		var divTag = document.createElement("div");
		divTag.className = version.className;
		divTag.innerHTML = version.label + ": " + version.version;
		document.getElementsByTagName("body")[0].appendChild(divTag);
	}

	function displayCreativeVersion()
	{
		displayVersion({
			label: "Creative Version",
			version: creativeVersion,
			className: "creativeVersion"
		});
	}

	function displayCustomJSVersion()
	{
		displayVersion({
			label: "Custom JS Version",
			version: customJSVersion,
			className: "customJSVersion"
		});
	}

	/* versioning display function ends */
	
	/* format versioning code starts, please do not alter or remove these functions */

	function setCreativeVersion()
	{
		EB._sendMessage("SET_CREATIVE_VERSION", {
			creativeVersion: creativeVersion,
			uid: EB._adConfig.uid
		});
		if (typeof displayCreativeVersion === "function")
		{
			displayCreativeVersion();
		}
		setCustomJSVersion();
	}

	function setCustomJSVersion()
	{
		window.addEventListener("message", function(event) {
			try
			{
				var data = JSON.parse(event.data);
				if (!data.data.hasOwnProperty("uid") || data.data.uid !== EB._adConfig.uid)
				{
					return;
				}
				if (data.type === "SET_CUSTOMJS_VERSION")
				{
					if (data.data.hasOwnProperty("customJSVersion"))
					{
						customJSVersion = data.data.customJSVersion;
						if (typeof displayCustomJSVersion === "function")
						{
							displayCustomJSVersion();
						}
					}
				}
			}
			catch (error)
			{
			}
		});	
	}

	/* format versioning code ends, please do not alter or remove these functions */	