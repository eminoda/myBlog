var app = angular.module('recharge.activity', ['ngCookies']);

app.controller('rechargeController', [
	'$scope',
	'$rootScope',
	'$http',
	'$httpParamSerializerJQLike',
	'$timeout',
	'$cookies',
	function($scope, $rootScope, $http, $httpParamSerializerJQLike, $timeout, $cookies) {
		$scope.bank = {
			amount: null,
			code: null
		};
		$scope.logBodStyle = {
			display: 'block'
		};
		$scope.recharge = true;

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

		$scope.easy = function() {
			$scope.bankOnline = true;
			$scope.selected = false;
			$scope.selected2 = true;
			$scope.recharge = false;
		};

		$scope.easyPay = function(bank) {
			$scope.bankOnline = true;
			$scope.selected = false;
			$scope.selected2 = true;

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
				form.find('input[name="payMode"]').val(1);
				form.find('input[name="terminal"]').val(0);
				form.submit();
				$scope.rechargeBox = true;
				$scope.errMsg = '支付请求已发送';
			}
		};
		$scope.wechat = function() {
			$scope.rechargeBox = true;
			$scope.bankOnline = false;
			$scope.selected = false;
			$scope.selected2 = false;

			$scope.errMsg = '暂不支持微信！';
		};

		$scope.bank = function() {
			$scope.bankOnline = true;
			$scope.selected = true;
			$scope.selected2 = false;
			$scope.recharge = true;
		};
		//充值
		$scope.bank.username = $cookies.get('userNameCookie');
		$scope.bankPay = function(bank) {
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
				//form.find('input[name="userbankCode"]').val(bank.code);
				form.find('input[name="payMode"]').val(0);
				form.find('input[name="terminal"]').val(0);
				form.submit();
				$scope.rechargeBox = true;
				$scope.errMsg = '支付请求已发送';
			}
		};

		$scope.select1 = true;
		$scope.select2 = true;
		$scope.select3 = true;
		$scope.select4 = true;
		$scope.select5 = true;
		$scope.select6 = true;
		$scope.select7 = true;
		$scope.select8 = true;
		$scope.select9 = true;

		//支付通道测试
		//银盛
		// $scope.ysePay = function() {
		//   $scope.bank.code = 50788438420493;
		//   $scope.select1 = false;
		//   $scope.select2 = true;
		//   $scope.select3 = true;
		//   $scope.select4 = true;
		//   $scope.select5 = true;
		// }
		//先锋
		// $scope.ucfPay = function() {
		//   $scope.bank.code = 51245231151193;
		//   $scope.select2 = false;
		//   $scope.select1 = true;
		//   $scope.select3 = true;
		//   $scope.select4 = true;
		//   $scope.select5 = true;
		// }
		//通联
		// $scope.allInPay = function() {
		//   $scope.bank.code = 50881509310693;
		//   $scope.select3 = false;
		//   $scope.select2 = true;
		//   $scope.select1 = true;
		//   $scope.select4 = true;
		//   $scope.select5 = true;
		// }
		//银生
		// $scope.unsPay = function() {
		//   $scope.bank.code = 49750879160903;
		//   $scope.select4 = false;
		//   $scope.select2 = true;
		//   $scope.select3 = true;
		//   $scope.select1 = true;
		//   $scope.select5 = true;
		// }
		//国付宝
		// $scope.goPay = function() {
		//   $scope.bank.code = 49760480167703;
		//   $scope.select5 = false;
		//   $scope.select2 = true;
		//   $scope.select3 = true;
		//   $scope.select4 = true;
		//   $scope.select1 = true;
		// }

		//支付通道生产
		//银盛
		$scope.ysePay = function() {
			$scope.bank.code = 51019388421703;
			$scope.select1 = false;
			$scope.select2 = true;
			$scope.select3 = true;
			$scope.select4 = true;
			$scope.select5 = true;
			$scope.select6 = true;
			$scope.select7 = true;
			$scope.select8 = true;
			$scope.select9 = true;
		};
		//先锋
		$scope.ucfPay = function() {
			$scope.bank.code = 51366935194003;
			$scope.select2 = false;
			$scope.select1 = true;
			$scope.select3 = true;
			$scope.select4 = true;
			$scope.select5 = true;
			$scope.select6 = true;
			$scope.select7 = true;
			$scope.select8 = true;
			$scope.select9 = true;
		};
		//通联
		$scope.allInPay = function() {
			$scope.bank.code = 51149237050803;
			$scope.select3 = false;
			$scope.select1 = true;
			$scope.select2 = true;
			$scope.select4 = true;
			$scope.select5 = true;
			$scope.select6 = true;
			$scope.select7 = true;
			$scope.select8 = true;
			$scope.select9 = true;
		};
		//银生
		$scope.unsPay = function() {
			$scope.bank.code = 49750879160903;
			$scope.select4 = false;
			$scope.select1 = true;
			$scope.select2 = true;
			$scope.select3 = true;
			$scope.select5 = true;
			$scope.select6 = true;
			$scope.select7 = true;
			$scope.select8 = true;
			$scope.select9 = true;
		};
		//国付宝
		$scope.goPay = function() {
			$scope.bank.code = 49760480167703;
			$scope.select5 = false;
			$scope.select1 = true;
			$scope.select2 = true;
			$scope.select3 = true;
			$scope.select4 = true;
			$scope.select6 = true;
			$scope.select7 = true;
			$scope.select8 = true;
			$scope.select9 = true;
		};
		//汇潮
		$scope.huichao = function() {
			$scope.bank.code = 51237214171503;
			$scope.select6 = false;
			$scope.select1 = true;
			$scope.select2 = true;
			$scope.select3 = true;
			$scope.select4 = true;
			$scope.select5 = true;
			$scope.select7 = true;
			$scope.select8 = true;
			$scope.select9 = true;
		};
		//甬易
		$scope.yongyi = function() {
			$scope.bank.code = 52351591466703;
			$scope.select7 = false;
			$scope.select1 = true;
			$scope.select2 = true;
			$scope.select3 = true;
			$scope.select4 = true;
			$scope.select5 = true;
			$scope.select6 = true;
			$scope.select8 = true;
			$scope.select9 = true;
		};
		//易宝
		$scope.yibao = function() {
			$scope.bank.code = 53965947611103;
			$scope.select8 = false;
			$scope.select1 = true;
			$scope.select2 = true;
			$scope.select3 = true;
			$scope.select4 = true;
			$scope.select5 = true;
			$scope.select6 = true;
			$scope.select7 = true;
			$scope.select9 = true;
		};
	}
]);
