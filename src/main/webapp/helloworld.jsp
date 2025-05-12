<%@ taglib uri="http://www.smartclient.com/taglib" prefix="sc" %>
<%@ page language="java" pageEncoding="UTF-8"  isELIgnored="false"%>
<!doctype html>
<HTML>
    <HEAD>
        <sc:loadISC skin="Tahoe"/></HEAD>
<BODY>
    <SCRIPT> isc.Button.create({title: "Hello", click: "isc.say('Hello World')"}) </SCRIPT>
</BODY>
</HTML>