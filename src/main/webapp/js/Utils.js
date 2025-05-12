isc.defineClass('Utils').addClassProperties({
    
    getContextPath: function() {
        const ele = document.getElementById('context_path');
	    return ele.getAttribute('data-value');
    },

    /**
	 * Add, update, or remove a parameter from RPCManager.actionURL.  Useful for managing CSRF tokens.
	 */
	setRpcParameter: function(name, value) {
        
        let url = isc.RPCManager.actionURL;
        let params = new URLSearchParams();
        const split = url.split('?');
        const path = split[0];
        if (split.length > 1) {
            params = new URLSearchParams(split[1]); 
        }
        if (value) {
            params.set(name, value);
        } else {
            params.delete(name);
        }
        url = path + '?' + params.toString();                                    
        isc.RPCManager.setActionURL(url);

        isc.Log.logDebug('RPCManager.actionURL updated to include changed parameter value.  New URL is ' + 
            isc.RPCManager.actionURL, 'Authentication');
    }	
});