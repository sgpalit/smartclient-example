
<%@ taglib uri="http://www.smartclient.com/taglib" prefix="sc" %>
<%@ page language="java" pageEncoding="UTF-8"  isELIgnored="false"%>
<%
/*
    Illustrates another way to load the SmartClient framework using the JSP tag 
    library.  The net result is almost identical to what you'll find in index.html, so you'd 
    normally choose one approach or the other, although the taglib does append a 
    'cache-busting' query string parameter to framework resources.  Refer to the 'SmartClient 
    JSP Tags' documentation topic for further discussion on the loadISC and loadDS tags, among 
    others.
    
    https://www.smartclient.com/smartclient-latest/isomorphic/system/reference/?id=group..jspTags
 */  
%>

<!doctype html>
<html>
  <head>
    <meta http-equiv="content-type" content="text/html; charset=UTF-8">
    
    <link type="text/css" rel="stylesheet" href="style.css">

    <!--                                           -->
    <!-- Any title is fine                         -->
    <!--                                           -->
    <title>SmartclientExample</title>

    <!-- Run in 'Portal Mode'.  Refer to the following for further discussion:                                 -->
    <!-- https://www.smartclient.com/smartclient-latest/isomorphic/system/reference/?id=group..simpleNamesMode -->
    <!--                                                                                                       -->
    <script>window.isc_useSimpleNames = false;</script>

    <sc:loadISC skin="Tahoe" />

  </head>

  <!--                                           -->
  <!-- The body can have arbitrary html, or      -->
  <!-- you can leave the body empty if you want  -->
  <!-- to create a completely dynamic UI.        -->
  <!--                                           -->
  <body style="overflow:hidden">

    <div id='context_path' data-value='${pageContext.request.contextPath}' ></div>

    <div id='authenticity_token' data-name='${_csrf.parameterName}' data-value='${_csrf.token}'></div>
    <div id='rememberme_enabled' data-value='${rememberMeAuthenticationRequested}'></div>

    <!-- Use something like the following to keep datasource loading separate (using e.g., the loadDS tag) -->
    <script src="./datasources.jsp" type="application/javascript"></script> 
    
    <!-- Or just load them inline if you prefer -->
    <!-- 
        <script src="./isomorphic/DataSourceLoader?dataSource=supplyItem"></script> 
    -->

    <!--                                                                                                    -->
    <!-- Finally, load your application source.  Here, we do so using the FileAssembly Servlet.     -->
    <!-- https://www.smartclient.com/smartclient-latest/isomorphic/system/reference/?id=group..fileAssembly -->
    <!--                                                                                                    -->
    <script src="./main.js" type="application/javascript"></script>

    <!-- RECOMMENDED if your web app will not unction without JavaScript enabled -->
    <noscript>
      <div style="width: 22em; position: absolute; left: 50%; margin-left: -11em; color: red; background-color: white; border: 1px solid red; padding: 4px; font-family: sans-serif">
        Your web browser must have JavaScript enabled
        in order for this application to display correctly.
      </div>
    </noscript>

<!--
    And now the login success marker that signals to the RPCManager that we were able to reauthenticate.  See /login.jsp for
    context and links on this topic.
  -->

<SCRIPT>//'"]]>>isc_loginSuccess
//
// When doing relogin with a webserver-based authenticator, protect this page with it and
// target your login attempts at this page such that when the login succeeds, this page is
// returned.
//
// If you are integrating with a web service that returns a fault, paste this entire script
// block VERBATIM into the fault text.
//=======    



if (!window.isc && document.domain && document.domain.indexOf(".") != -1 
    && !(new RegExp("^(\\d{1,3}\\.){3}\\d{1,3}$").test(document.domain))) 
{
    
    var set = false;
    while (document.domain.indexOf(".") != -1) {
        try {
            if (window.opener && window.opener.isc) break;
            if (window.top.isc) break;
            
            if (!set) { document.domain = document.domain; set = true; }
            else { document.domain = document.domain.replace(/.*?\./, ''); }
        } catch (e) {
            try {
                if (!set) { document.domain = document.domain; set = true }
                else { document.domain = document.domain.replace(/.*?\./, ''); }
            } catch (ee) {
                break;
            }
        }
    } 
}

var isc = top.isc ? top.isc : window.opener ? window.opener.isc : null;
if (isc) isc.RPCManager.delayCall("handleLoginSuccess", [window]);
</SCRIPT>

  </body>
</html>