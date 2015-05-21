---
title: Blog
---

Blog
====

<% for (var post of blogList) { %>
### [<%= post.title %>](<%- post.url %>)
_<%- post.date.toISOString().substr(0, 10) %>_

<%- post.teaser %>

<% } %>
