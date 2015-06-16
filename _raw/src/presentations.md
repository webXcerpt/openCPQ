---
title: Presentations
---

Presentations
=============

<% for (var post of presentationList) { %>
### [<%= post.title %>](<%- post.url %>)

<%- post.presenter %>, 
_[<%- post.venue %>](<%- post.venue_url %>)_,
<%- post.dateString %>

<% } %>
