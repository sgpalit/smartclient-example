isc.defineClass('AuthenticationManager').addProperties({

    token: {},
    resubmitOnLoginRequired: false,

    userProfile: {},
    userAuthorizations: [],

    loginWindowDefaults: {

        _constructor: 'Window',
        visibility: 'hidden',
        autoCenter: true,
        title: 'Session Expired',
        showCloseButton: false,
        showMinimizeButton: false,
        showMaximizeButton: false,
        width: 400,
        height: 260,
        isModal: true,
        showModalMask: true,
        showFooter: true,
        footerHeight: 36,
        
        form: null,
    
        initWidget: function() {
    
            this.Super('initWidget', arguments);
            const that = this;

            const form = isc.DynamicForm.create({
                titleOrientation: 'top',
                titleSuffix: null,
                requiredTitleSuffix: null,
                numCols: 1,
                saveOnEnter: true,
                items: [
                    {
                        /*
                         * Here we choose to force the username, so that we don't need to worry about reinitializing
                         * the app if someone were to login using different but valid credentials.
                         */
                        editorType: 'StaticTextItem',
                        name: 'username',
                        title: 'Username',
                        width: 200,
                        required: true,
                        canEdit: false,
                        formatValue: function(value, record, form, item) {
                            if (! value) {
                                return;
                            }
                            // mask all but the first character
                            return value.substring(0, 1).concat(value.replace(/./g,'*').substring(1));
                        }
                    },{
                        editorType: 'PasswordItem',
                        name: 'password',
                        title: 'Password',
                        width: 200,
                        required: true
                    }
                ],
                submit: function() {
                    that.creator.relogin();
                }
            });
    
            // Make the form easily accessible from the show function
            this.form = form;
    
            const button = isc.IButton.create({
                title: 'Login',
                width: 80,
                click: function() {
                    that.creator.relogin();
                }
            });
    
            const buttonLayout = isc.HLayout.create({
                members: [
                    isc.LayoutSpacer.create(),
                    button,
                    isc.LayoutSpacer.create()
                ]
            });
    
            const vLayout = isc.VLayout.create({
                membersMargin: 20,
                layoutTopMargin: 40,
                layoutLeftMargin: 80,
                members: [
                    form
                ]
            });        
    
            this.addItem(vLayout);
            this.addItem(isc.LayoutSpacer.create());
            this.addItem(buttonLayout);
        },
    
        show: function() {
        
            /* 
             * This whole flow can be triggered by background RPC calls (e.g., polling for notification data) while the window
             * is already open - bail in that case 
             */
            if (this.isVisible() && this.isDrawn()) {
                return;
            }
    
            const form = this.form;
    
            form.setValue('username', this.creator.getCurrentUserName());
            form.clearValue('password');
            form.focusInItem('password');
    
            this.setStatus(null);
            this.bringToFront();
            
            this.Super('show', arguments);
        }
    },

    init: function() {
        this.Super('init', arguments);
        this.loginWindow = this.createAutoChild('loginWindow');

        that = this;
        let retryCount = 0;
        const retryAttemptThreshold = 2;
        isc.RPCManager.loginRequired = function(transactionNum, rpcRequest, rpcResponse) {
            
            that.setAuthenticityToken(rpcResponse);
    
            /* 
             * If remember-me services have been requested, spring should normally allow resubmission once we have the right csrf token...
             * But you could end up though with a case where the remembered creds have become invalid - the key changes at the 
             * server, for example - and you really do need to authenticate again.  Retry only so many times. 
             */
            if (that.resubmitOnLoginRequired && retryCount < retryAttemptThreshold) {
                    
                // if and when this dummy request goes unsuspended and the callback fires, we can reset the count
                isc.RPCManager.sendRequest({willHandleError: true}, function(rpcResponse, rawData, rpcRequest) {
                    retryCount = 0;
                });
    
                retryCount++;
                isc.RPCManager.resendTransaction();
                
            } else {
                that.showLoginWindow();    
            } 
        }
    },

    showLoginWindow: function() {
        this.loginWindow.show();
    },

    /*
	 * Loads user/contact details of the currently authenticated user asynchronously. Note
	 * that {@link #getCurrentUser()} returns null until the asynchronous operation's callback is fired.
	 * Also note that the server will by design determine who the current user is without any input from the client.
	 */
    loadUserProfile: function() {
    
        const that = this;

        const userDataSource = isc.DataSource.get('User');
		userDataSource.fetchData(null, function(dsResponse, data, dsRequest) {
            
            that.userProfile = data[0];

        }, {operationType: 'fetch', operationId: 'fetchCurrentUser'});

        const roleDataSource = isc.DataSource.get('UserRole');
        roleDataSource.fetchData(null, function(dsResponse, data, dsRequest) {

            that.userAuthorizations = data;

        }, {operationType: 'fetch', operationId: 'fetchByCurrentUser'});

    },

    getCurrentUser: function() {
        return this.userProfile;
    },

    getCurrentUserName: function() {
        return this.userProfile.username;
    },

    isUserInRole: function(role) {
        return this.userAuthorizations.find(`role`, role) != null;
    },

    logout: function() {
        const logout = {
            actionURL: isc.Utils.getContextPath() + '/logout',
            containsCredentials: true,
            useSimpleHttp: true,
            showPrompt: false,
            callback: function(rpcResponse, data, rpcRequest) {
                window.location.replace(isc.Utils.getContextPath());
            }
        }
        const token = this.token;
        if (token) {
            const name = token.name;
            const value = token.value;
            const params = {};
            params[name] = value;
            logout.params = params;
        }
		isc.RPCManager.sendRequest(logout);
    },

    relogin: function() {
        const win = this.loginWindow;
        const form = win.form;
        const token = this.token; 
        
        form.setValue(token.name, token.value);
        
        const that = this;
        const login = {
            actionURL: isc.RPCManager.credentialsURL,
            containsCredentials: true,
            useSimpleHttp: true,
            showPrompt: false,
            params: form.getValues(),
            callback: function(rpcResponse, rawData, rpcRequest) {

                that.setAuthenticityToken(rpcResponse);

                if (rpcResponse.status == isc.RPCResponse.STATUS_SUCCESS) {
                    win.close();
                    isc.RPCManager.resendTransaction();                    
                } else {
                    win.setStatus(`Login Failed.  Please try again, or close your browser to quit.`);
                }
            }            
        }
        isc.RPCManager.sendRequest(login);
    },

    /**
	 * Inspects the bootstrap page for a div that should contain a CSRF token as assigned to the 
	 * request by Spring Security, and includes it with all future RPC requests by 
	 * calling setAuthenticityToken.
	 */
	setAuthenticityToken: function(rpcResponse) {

        const remembered = document.getElementById('rememberme_enabled').getAttribute('data-value');
        this.resubmitOnLoginRequired = remembered;

        let html = document.documentElement.outerHTML;
        let name;
        let value;

        if (rpcResponse) {
            html = rpcResponse.httpResponseText;
            const token = html.match(/<div id='authenticity_token' data-name='(.*)' data-value='(.*)'/);
            name = token[1];
            value = token[2];
        } else {
            const token = document.getElementById('authenticity_token');
		    name = token.getAttribute('data-name');
		    value = token.getAttribute('data-value');
        }

		if (name && value) {
            
            this.token = {name: name, value: value};
            isc.Utils.setRpcParameter(name, value);
            
		} else {
			isc.logWarn("Authenticity token not found in bootstrap html: \n" + document.documentElement.outerHTML, "Authentication");
		}
	}
});