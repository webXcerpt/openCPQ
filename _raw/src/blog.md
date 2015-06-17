---
title: Blog
---

Blog
====

<% for (var post of groups.blog) { %>
### [<%= post.title %>](<%- post.url %>)
_<%- post.dateString %>, <%- post.author %>_

<%- post.teaser %>

<% } %>
