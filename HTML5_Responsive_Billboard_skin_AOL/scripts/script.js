/*******************
 VARIABLES
*******************/
	var creativeVersion = "1.0.0";	// format versioning code, please do not alter or remove this variable
	var customJSVersion = null;		// format versioning code, please do not alter or remove this variable 
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
		setCreativeVersion();		// format versioning code, please do not alter or remove this function
	}
	
/*******************
 EVENT HANDLERS
*******************/
	
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