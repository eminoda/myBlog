<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/gitalk@1/dist/gitalk.css">
<script src="https://cdn.jsdelivr.net/npm/gitalk@1/dist/gitalk.min.js"></script>

<div id="gitalk-container"></div>

{% set md5_js_uri = url_for('/lib/md5/md5.min.js') %}
<script src="{{ md5_js_uri }}"></script>
<script src="{{ url_for('/lib/jquery/index.js?v=2.1.3') }}"></script>

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
	var id = md5('{{url_for(page.path)}}')
	var gitalk = new Gitalk({
	  clientID: '{{theme.git_talk.clientID}}',//'f5e934819613a06d3a38',
	  clientSecret: '{{theme.git_talk.clientSecret}}',//'f9ff1926fed5174d6f6e438e5e37dd5341af81fe',
	  repo: 'eminoda.github.io',
	  owner: 'eminoda',
	  admin: ['eminoda'],
	  perPage: 20,
	  id: id,
	  title: '{{page.title}}',
	  // labels: tags,
	  body: '🚀 '+location.href+'\n\n欢迎通过 issues 留言 ，互相交流学习😊'
	})
	gitalk.render('gitalk-container')
</script>

<style>
	#issues_url{
		text-align: center;
    	font-size: 16px;
	}
	#issues_url a{
		color:#6190e8;
	}
</style>
<div id="issues_url">📢 因为是开源博客，为避免 <strong>Gitalk授权 </strong>带来的 <a href="https://github.com/dear-github/dear-github/issues/113">安全风险</a>，也可访问
</div>

<script>
$.get('https://api.github.com/repos/eminoda/eminoda.github.io/issues?labels=Gitalk,'+id+'&t={{Date.now()}}').then(data=>{
	if(data && data.length>0){
		var issuesUrl = data[0].html_url
		const $a = document.createElement('a')
		$($a).attr('href',issuesUrl).attr('alt',issuesUrl).attr('target','blank').text('👉issues链接 ')
		$('#issues_url').append($a).append('进行留言📝')
	}
})
</script>
