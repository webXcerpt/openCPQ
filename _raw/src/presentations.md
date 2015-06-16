---
title: Presentations
---

Presentations
=============

<% for (var post of groups.presentation) { %>
### [<%= post.title %>](<%- post.url %>)

<%- post.presenter %>, 
_[<%- post.venue %>](<%- post.venue_url %>)_,
<%- post.dateString %>

<% } %>
