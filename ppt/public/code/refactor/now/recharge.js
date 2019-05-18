var app = angular.module('recharge.activity', ['ngCookies']);

app.controller('rechargeController', [
	'$scope',
	'$rootScope',
	'$http',
	'$httpParamSerializerJQLike',
	'$timeout',
	'$cookies',
	function($scope, $rootScope, $http, $httpParamSerializerJQLike, $timeout, $cookies) {
		// 支付列表
		// 先锋 51366935194003;通联	51149237050803;银盛	51019388421703;
		// 国付宝 49760480167703;银生 49750879160903;汇潮 51237214171503;传化 54028218509303
		$scope.chooseId;
		$scope.payList = [
			{
				name: '甬易支付',
				imageName: 'yongyi.png',
				payChannelId: 52351591466703
			},
			{
				name: '易宝支付',
				imageName: 'yibao.png',
				payChannelId: 53965947611103
			},
			{
				name: '富友支付',
				imageName: 'fuyou.png',
				payChannelId: 55704023830703
			}
		];
		$scope.bank = {
			amount: null,
			code: null,
			username: $cookies.get('userNameCookie')
		};
		$scope.choosePayChannel = function(payChannelId) {
			$scope.chooseId = $scope.bank.code = payChannelId;
		};
		$scope.payType = ''; //1 网上银行；2 快捷支付；3 微信
		$scope.choosePayWay = function(payType) {
			$scope.payType = payType;
			if (payType == 3) {
				$scope.rechargeBox = true;
				$scope.errMsg = '暂不支持微信！';
			}
		};
		if ($cookies.get('userNameCookie') == null) {
			$scope.user = true;
		} else {
			$scope.user = false;
			$scope.text = $cookies.get('userNameCookie');
		}

		//用户退出
		$scope.logOut = function() {
			var formData = {
				method: 'POST',
				url: '/niu/register/logOut.api',
				data: {}
			};
			var promise = $http({
				method: formData.method,
				url: formData.url,
				data: $httpParamSerializerJQLike(formData.data),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			}).success(function(req) {
				$scope.user = true;
				window.location.href = '/views/index.html';
			});
		};

		$scope.closeBox = function() {
			$scope.rechargeBox = false;
		};

		$scope.toPay = function(bank) {
			var payMode = $scope.payType == 1 ? 0 : $scope.payType == 2 ? 1 : '';
			if ($cookies.get('whetherSysCookie') == null || $cookies.get('whetherSysCookie') == 0) {
				$scope.rechargeBox = true;
				$scope.errMsg = '未实名认证无法充值';
			} else if (bank.amount == null || bank.amount == '') {
				$scope.rechargeBox = true;
				$scope.errMsg = '请输入充值金额';
			} else if (bank.amount < 3) {
				$scope.rechargeBox = true;
				$scope.errMsg = '充值金额不能小于3元';
			} else if (bank.amount >= 10000) {
				$scope.rechargeBox = true;
				$scope.errMsg = '充值金额不能大于1万元';
			} else if (bank.code == null) {
				$scope.rechargeBox = true;
				$scope.errMsg = '请选择充值银行';
			} else {
				var form = $('.pay-form');
				form.find('input[name="account"]').val(bank.username);
				form.find('input[name="amount"]').val(bank.amount);
				form.find('input[name="payChannelId"]').val(bank.code);
				form.find('input[name="payMode"]').val(payMode);
				form.find('input[name="terminal"]').val(0);
				form.submit();
				$scope.rechargeBox = true;
				$scope.errMsg = '支付请求已发送';
			}
		};
	}
]);
