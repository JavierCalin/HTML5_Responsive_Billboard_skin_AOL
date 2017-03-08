/*******************
 VARIABLES
*******************/
	var creativeVersion = "1.0.0";	// format versioning code, please do not alter or remove this variable
	var customJSVersion = null;		// format versioning code, please do not alter or remove this variable 
	var container;
	var expandButton;
	var isAndroid2 = (/android 2/i).test(navigator.userAgent);
	var android2ResizeTimeout;
	
	window.addEventListener("load", checkIfEBInitialized);
	window.addEventListener("message", onMessageReceived);
	
/*******************
 INITIALIZATION
*******************/
	function checkIfEBInitialized(event) 
	{
		if (EB.isInitialized()) initializeCreative();
		else EB.addEventListener(EBG.EventName.EB_INITIALIZED, initializeCreative);
	}
	
	function initializeCreative(event) 
	{
		initializeGlobalVariables();
		addEventListeners();
		setCreativeVersion();		// format versioning code, please do not alter or remove this function
		setTimeout(checkIfVisibleOnLoad, 1000);
	}
	
	function initializeGlobalVariables() 
	{
		
		expandButton = document.getElementById("expand-button");
		
	}
	
	function addEventListeners() 
	{
		
		expandButton.addEventListener("click", expand);
		
	}
	
	function checkIfVisibleOnLoad() {
		if (isFirstExpansion()) {
			if (isAdVisible()) {
				EB.automaticEventCounter("Leave_Behind_Load");	
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
	
	
	function expand(event) 
	{
		EB.collapse();
		EB.expand({panelName:'billboard'});
	}
	
	function onMessageReceived(event) 
	{
		EBG.log.debug("event: "+event);
		try {
			var messageData = JSON.parse(event.data);
		
			if (messageData.adId && messageData.adId === getAdID()) 
			{
				if (messageData.type && messageData.type === "resize") 
				{
					if (isAndroid2) android2OnResizeHandler();
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