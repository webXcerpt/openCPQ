---
title: "Blog"
isBlogList: true
prio: 999
---

Blog
====

{% for post in site.posts %}
## <a href="{{ post.url | prepend:site.baseurl }}">{{ post.date | date: "%Y-%m-%d" }}: {{ post.title }}</a>

{{ post.content | truncatewords: 50 }}
{% endfor %}
