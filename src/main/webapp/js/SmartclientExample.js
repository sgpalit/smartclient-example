
isc.setAutoDraw(false);

isc.defineClass('SmartclientExample').addClassProperties({

    authenticationManager: null,
    resubmitOnLoginRequired: false,

    start: function() {

        isc.RPCManager.credentialsURL = isc.Utils.getContextPath() + '/login';

        const authenticationManager = this.authenticationManager = isc.AuthenticationManager.create();
        authenticationManager.setAuthenticityToken();

        /*
        * Note that the user has already proven their identity or they'd be unable to load the bootstrap page 
        * containing this application, as it's protected by our security configuration.  Now, we can just 
        * load the authenticated user's profile data - useful for example when determining visibility of 
        * protected controls, etc.
        * 
        * Also note that loadUserProfile submits 2 asynchronous fetches, but queueing allows us to combine 
        * them intelligently.  Refer to the RPCManager.startQueue documentation topic for further discussion: 
        * https://www.smartclient.com/smartclient-latest/isomorphic/system/reference/?id=classMethod..RPCManager.startQueue
        */
        isc.RPCManager.startQueue();
        authenticationManager.loadUserProfile();
        isc.RPCManager.sendQueue(function(rpcResponse) {

            /*
             * Only an admin may add, edit, or remove an employee record.  Show controls accordingly, but the 
             * server would enforce this rule regardless.  
             */
            const isAdminUser = authenticationManager.isUserInRole('ADMIN');

            const grid = isc.ListGrid.create({
                dataSource: 'Employee',
                autoFetchData: true,
                sortField: 'lastName',
                listEndEditAction: 'next',
                canEdit: isAdminUser,
                canRemoveRecords: isAdminUser
            });
            
            const refresh = isc.ToolStripButton.create({
                title: 'Refresh',
                icon: '[SKIN]/actions/refresh.png',
                prompt: 'Allow the session to timeout and click the refresh button to trigger a relogin flow',
                click: function() {
                    grid.refreshData();
                }
            });

            const menu = isc.Menu.create({
                items: [{
                    title: 'Logout',
                    click: function() {
                        authenticationManager.logout()
                    }
                }]
            });
            
            const toolstrip = isc.ToolStrip.create({
                members: [
                    refresh,
                    isc.ToolStripSpacer.create(),
                    
                    // Minor personalization of a menu button using user data
                    isc.ToolStripMenuButton.create({
                        title: authenticationManager.getCurrentUserName(),
                        menu: menu
                    })
                ]
            });
            
            const layout = isc.VLayout.create({
                ID: 'MainLayout',
                width: '100%', height: '100%',
                padding: 20,
                members: [
                    toolstrip, grid
                ]
            });

            layout.draw();
        })
    }
});

isc.SmartclientExample.start();