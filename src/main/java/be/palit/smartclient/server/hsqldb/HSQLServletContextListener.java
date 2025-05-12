/*
 * Isomorphic SmartClient web presentation layer
 * Copyright 2000 and beyond Isomorphic Software, Inc.
 *
 * OWNERSHIP NOTICE
 * Isomorphic Software owns and reserves all rights not expressly granted in this source code,
 * including all intellectual property rights to the structure, sequence, and format of this code
 * and to all designs, interfaces, algorithms, schema, protocols, and inventions expressed herein.
 *
 *  If you have any questions, please email <sourcecode@isomorphic.com>.
 *
 *  This entire comment must accompany any portion of Isomorphic Software source code that is
 *  copied or moved from this file.
 */

package be.palit.smartclient.server.hsqldb;

import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.annotation.WebListener;

import org.hsqldb.Server;
import static org.hsqldb.Database.CLOSEMODE_NORMAL;

/**
 * A ServletContextListener that just starts and stops the sample HSQL database server with the web application.
 * Unnecessary, of course, when using other than the sample database.
 */
@WebListener
public class HSQLServletContextListener implements ServletContextListener {
    
    private static final String DATA_DIR_PROPERTY = "/WEB-INF/db/samples";
    private static final String DB_CLASSICMODELS = "classicmodels";
    private static final String DB_ISOMORPHIC = "isomorphic";
    
    private Server server = new Server();
    
    public void contextInitialized(ServletContextEvent sce) {

        try {
            
            ServletContext context = sce.getServletContext();

            String path = context.getRealPath(DATA_DIR_PROPERTY);

            server.setDatabaseName(0, DB_CLASSICMODELS); 
            server.setDatabasePath(0, path + "/" + DB_CLASSICMODELS); 
            server.setDatabaseName(1, DB_ISOMORPHIC); 
            server.setDatabasePath(1, path + "/" + DB_ISOMORPHIC); 

            server.start();    

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public void contextDestroyed(ServletContextEvent sce) {
    	server.shutdownWithCatalogs(CLOSEMODE_NORMAL);
    }
}