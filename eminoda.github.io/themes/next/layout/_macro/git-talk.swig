<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/gitalk@1/dist/gitalk.css">
<script src="https://cdn.jsdelivr.net/npm/gitalk@1/dist/gitalk.min.js"></script>

<div id="gitalk-container"></div>

{% set md5_js_uri = url_for('/lib/md5/md5.min.js') %}
<script src="{{ md5_js_uri }}"></script>

<script>
	// https://node-swig.github.io/swig-templates/docs/tags/
	// https://github.com/gitalk/gitalk/issues/102
	// https://hexo.io/zh-cn/docs/variables.html#%E9%A1%B5%E9%9D%A2%E5%8F%98%E9%87%8F
	var tags = []
</script>
{% if page.tags.length %}
	{% for tag in page.tags %}
	<script>tags.push('{{tag.name}}')</script>
	{% endfor %}
{% endif %}


<script type="text/javascript">
	console.log('{{url_for(page.path)}}',md5('{{url_for(page.path)}}'))
	var gitalk = new Gitalk({
	  clientID: '{{theme.git_talk.clientID}}',//'f5e934819613a06d3a38',
	  clientSecret: '{{theme.git_talk.clientSecret}}',//'f9ff1926fed5174d6f6e438e5e37dd5341af81fe',
	  repo: 'eminoda.github.io',
	  owner: 'eminoda',
	  admin: ['eminoda'],
	  perPage: 20,
	  id: md5('{{url_for(page.path)}}'),
	  title: '{{page.title}}',
	  // labels: tags,
	  body: '🚀 '+location.href+'\n\n欢迎通过 issues 留言 ，互相交流学习😊'
	})
	gitalk.render('gitalk-container')
</script>
