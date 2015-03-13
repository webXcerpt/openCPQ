---
title: "Blog"
isBlogList: true
prio: 999
---

Blog
====

{% for post in site.posts %}
## [{{ post.date | date: "%Y-%m-%d" }}: {{ post.title }}]({{ post.url | prepend:site.baseurl }})

{{ post.content | truncatewords: 50 }}
{% endfor %}
