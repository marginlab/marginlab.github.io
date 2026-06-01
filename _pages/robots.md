---
title: "MARGIN Lab - Robots"
layout: textlay
excerpt: "Robots at MARGIN Lab"
sitemap: false
permalink: /robots/
breadcrumb:
  - title: Robots
---

## <span style="color: #8C1D40;"><strong>Robots &amp; Devices</strong></span>

{% assign featured_robots = site.data.robots | where: "featured", true %}
{% assign other_robots = site.data.robots | where: "featured", false %}

<div class="row" style="margin-top: 30px; display: flex; flex-wrap: wrap;" markdown="0">
{% for robot in featured_robots %}
<div class="col-sm-4" style="margin-bottom: 10px; padding-left: 8px; padding-right: 8px; display: flex;">
<div style="border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; width: 100%; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
<div style="background: #ffffff; padding: 10px 10px 0; height: 230px; overflow: hidden;">
<img src="{{ site.url }}{{ site.baseurl }}/images/teampic/{{ robot.photo }}" style="width: 100%; height: 100%; object-fit: contain; object-position: top;" />
</div>
<div style="padding: 15px 20px 15px 20px; display: flex; flex-direction: column; flex: 1;">
<h4 style="color: #8C1D40; font-weight: bold; margin-bottom: 8px;"><a href="{{ site.url }}{{ site.baseurl }}{{ robot.url }}" style="color: #8C1D40; text-decoration: none;">{{ robot.name }}</a></h4>
{% if robot.description %}<p style="font-size: 0.9em; color: #555; margin-bottom: 10px;">{{ robot.description }}</p>{% endif %}
<div style="margin-top: auto; text-align: right;">
<a href="{{ site.url }}{{ site.baseurl }}{{ robot.url }}" style="color: #8C1D40; font-size: 0.9em; text-decoration: none;">More Details &#8594;</a>
</div>
</div>
</div>
</div>
{% endfor %}
</div>

<div class="row" style="margin-top: 10px; display: flex; flex-wrap: wrap;" markdown="0">
{% for robot in other_robots %}
<div class="col-sm-3" style="margin-bottom: 20px; padding-left: 8px; padding-right: 8px; display: flex;">
<div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 8px 15px 6px; width: 100%; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
<div style="display: flex; align-items: flex-start;">
<img src="{{ site.url }}{{ site.baseurl }}/images/teampic/{{ robot.photo }}" style="width: 100px; height: 100px; object-fit: contain; margin-right: 12px; flex-shrink: 0;" />
<div style="padding-top: 6px;">
<h5 style="color: #8C1D40; font-weight: bold; font-size: 0.95em; margin-bottom: 5px;"><a href="{{ site.url }}{{ site.baseurl }}{{ robot.url }}" style="color: #8C1D40; text-decoration: none;">{{ robot.name }}</a></h5>
{% if robot.description %}<p style="font-size: 0.82em; color: #555; margin-bottom: 8px;">{{ robot.description }}</p>{% endif %}
<a href="{{ site.url }}{{ site.baseurl }}{{ robot.url }}" style="color: #8C1D40; font-size: 0.85em; text-decoration: none;">More Details &#8594;</a>
</div>
</div>
</div>
</div>
{% endfor %}
</div>
