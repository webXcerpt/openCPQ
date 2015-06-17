---
title: Blog
---

Blog
====

<% for (var post of groups.blog) { %>
### [<%= post.title %>](<%- mkRelative(post.url) %>)
_<%- post.dateString %>, <%- post.author %>_

<%- post.teaser %>

<% } %>
