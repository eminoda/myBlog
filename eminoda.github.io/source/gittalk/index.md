<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/gitalk@1/dist/gitalk.css">
<script src="https://cdn.jsdelivr.net/npm/gitalk@1/dist/gitalk.min.js"></script>

<div id="gitalk-container"></div>

<script type="text/javascript">
	var gitalk = new Gitalk({
	  clientID: '{{theme.git_talk.clientID}}',//'f5e934819613a06d3a38',
	  clientSecret: '{{theme.git_talk.clientSecret}}',//'f9ff1926fed5174d6f6e438e5e37dd5341af81fe',
	  repo: 'eminoda.github.io',
	  owner: 'eminoda',
	  admin: ['eminoda'],
	  title: 'git-talk-welcome',
	  id:'git-talk-welcome',
	  body: '此站点已添加 gittalk 功能，欢迎通过 issues 留言，互相交流学习😊',
	  perPage: 20
	})

	gitalk.render('gitalk-container')
</script>
