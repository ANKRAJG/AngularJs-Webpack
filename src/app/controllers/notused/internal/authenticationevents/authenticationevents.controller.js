(function() {
	'use strict';

	angular.module('EventsApp').controller('AuthenticationEventsController',
			AuthenticationEventsController);

	AuthenticationEventsController.$inject = [ 'AuthenticationService', 'EventService',
			'FlashService', '$scope' ,'UserService','$uibModal','MAINURL'];
	function AuthenticationEventsController(AuthenticationService, EventService,
			FlashService, $scope, UserService, $uibModal, MAINURL) {

		var vm = this;
		vm.RemoveFilterItem = RemoveFilterItem;
		vm.GetAuthenticateEventsByNoofDays = GetAuthenticateEventsByNoofDays;
		vm.GetAuthenticateEventsByDuration = GetAuthenticateEventsByDuration;
		vm.showMoreUserDetails = showMoreUserDetails;
		(function initController() {
            vm.filtertype="filterbynoofdays";
            vm.todayDate = new Date();
			SetGridDefaults();
			GetCompanyName();
			GetAuthenticateEventsByNoofDays(15);
		})();
		$scope.dateFormat = "yyyy-MM-dd"

		$scope.setGridEvents = function(event, reinitializeGrid) {
			$scope.gridReload = event;
			$scope.reinitializeGrid = reinitializeGrid;
		};

		function SetGridDefaults() {
			vm.events = [];
			var statuses = [ 'SUCCESS', 'FAILED', 'STARTED', 'INPROGRESS' ];
			vm.searchData = [ {
				field : 'userName',
				caption : 'UserName',
				type : 'text'
			}, {
				field : 'email',
				caption : 'Email',
				type : 'text'
			}, {
				field : 'userType',
				caption : 'User Type',
				type : 'text'
			}, {
				field : 'moduleName',
				caption : 'Module Name',
				type : 'text'
			}, {
				field : 'type',
				caption : 'type',
				type : 'text'
			}, {
				field : 'status',
				caption : 'Status',
				type : 'combo',
				items : statuses
			}, {
				field : 'description',
				caption : 'Description',
				type : 'text'
			}, {
				field : 'company',
				caption : 'Company',
				type : 'text'
			}, {
				field : 'projectName',
				caption : 'Project Name',
				type : 'text'
			}, {
				field : 'eventCreatedTime',
				caption : 'Created Time',
				type : 'text'
			}, {
				field : 'ipAddress',
				caption : 'IP Address',
				type : 'text'
			}

			];
			vm.sortData = [ {
				field : 'eventCreatedDate',
				direction : 'desc'
			} ];

			vm.columnsData = [ {
				field : 'userName',
				caption : 'User',
				sortable : true,
				size : '10%',
				resizable : true,
				editable :false
			},

			{
				field : 'email',
				caption : 'Email',
				sortable : true,
				size : '10%',
				tooltip : 'Email',
				resizable : true,
				editable :false,
			    render : function(record) {
				return '<a class="handCursor" onclick=\'showUserEmailClicked('+JSON.stringify(record.email)+');\'>'+ record.email + '</a>';
				// return '<a class="handCursor"
				// onclick=\'showMoreClicked('+JSON.stringify(record)+');\'>Show
				// project meta data</a>';
			}
			}, {
				field : 'userType',
				caption : 'User Type',
				sortable : true,
				size : '10%',
				tooltip : 'User Type',
				resizable : true,
				editable :false
			}, {
				field : 'moduleName',
				caption : 'Module Name',
				sortable : true,
				tooltip : 'Module Name',
				size : '10%',
				resizable : true,
				editable :false
			}, {
				field : 'type',
				caption : 'Type',
				sortable : true,
				size : '8%',
				resizable : true,
				tooltip : 'Type',
				editable :false
			}, {
				field : 'status',
				caption : 'Status',
				sortable : true,
				size : '5%',
				tooltip : 'Status',
				resizable : true,
				editable :false
			}, {
				field : 'description',
				caption : 'Description',
				sortable : true,
				size : '17%',
				tooltip : 'Description',
				resizable : true,
				editable :false
			}, {
				field : 'company',
				caption : 'Company',
				sortable : true,
				size : '10%',
				tooltip : 'Company',
				resizable : true,
				editable :false
			}, {
				field : 'projectName',
				caption : 'Project Name',
				sortable : true,
				size : '10%',
				tooltip : 'Project Name',
				resizable : true,
				editable :false
			}, {
				field : 'eventCreatedTime',
				caption : 'Created Time',
				sortable : true,
				size : '10%',
				tooltip : 'Created Time',
				resizable : true,
				editable :false
			}, {
				field : 'ipAddress',
				caption : 'IP Address',
				sortable : true,
				size : '10%',
				tooltip : 'IP Address',
				resizable : true,
				editable :false
			} ];


		}
		function GetSelectedRecord(recid){
			vm.selectedIndexList = $scope.selectedGridValue();
			if (vm.selectedIndexList.length > 0) {
				for (var i = 0; i < vm.events.length; i++) {
					if (vm.events[i].recid === vm.selectedIndexList[0]) {// This
						// is
						// only
						// when
						// there
						// is
						// single
						// select
						// option
						// is
						// there
						vm.selectedRecord = vm.recordsData[i];
						return 1;
					}
				}
			}
			return 0;
		}




		function showMoreUserDetails(email) {
			if (email != undefined) {
				GetSelectedUserDetails(email);
			}
		}

		function GetSelectedUserDetails(record) {
			UserService.GetByUserEmail(record, function(response) {
				if (response.success) {
					vm.selectedUser = response.data;
					ShowMoreUserDetailsPopup(vm.selectedUser);
				} else {
					FlashService.Error(response.message);
					vm.dataLoading = false;
				}

			});

		}

       function ShowMoreUserDetailsPopup(user) {
			var modalInstance2 = $uibModal
					.open({
						animation : true,
						templateUrl : MAINURL
								+ 'views/eventmanagement/userdetails.showmore.view.html',
						controller : 'EventsManagementShowMoreUserDetailsController',
						backdrop : 'static',
						resolve : {
							items : function() {
								return user
							}
						}
					});
			modalInstance2.result.then(function(data) {
			}, function() {
			});
		}

        $scope.ExportData = function(gridName) {
			$scope.$broadcast("ExportData", {
				gridName : gridName,
				fileName : 'All_Events_' + Date.now()
			});
		};

		$scope.$on('FilteredData', function(event, data) {
			vm.searchType = data.searchType;
			if (!$scope.$$phase) {
				$scope.$apply(function() {
					if (vm.searchType == "multi") {
						for (var i = 0; i < data.searchData.length; i++) {
							data.searchData[i].caption = getCaption(
									data.searchData[i], vm.columnsData);
						}
						vm.searchData = data.searchData;
					}
				});
			}
		});

		function getCaption(dataItem, columns) {
			return columns.filter(function(column) {
				return column.field == dataItem.field;
			})[0].caption;
		}

		function RemoveFilterItem(index) {
			vm.searchData.splice(index, 1);
			$scope.$broadcast('search', vm.searchData);
		}

		function GetCompanyName() {
			vm.companyName = AuthenticationService.GetCompanyName();
		}

		function GetAuthenticateEvents() {
			vm.dataLoading = "Loading Events... Please wait...";
			EventService.GetAuthenticateEvents(function(response) {
				if (response.success) {
					vm.events = response.data;
					vm.recordsData = response.data;
					$scope.$broadcast("RebuildGrid",vm.recordsData);
					vm.dataLoading = false;
				} else {
					FlashService.Error(response.message);
					vm.dataLoading = false;
				}

			});
		}
		function GetAuthenticateEventsByDuration(fromDate,toDate){
			var convertedFromDate = moment(fromDate).format("YYYY-MM-DD");
			var convertedToDate = moment(toDate).format("YYYY-MM-DD");
			vm.dataLoading = "Loading Events... Please wait...";
			EventService.GetAuthenticateEventsByDurationPeriod(convertedFromDate,convertedToDate,function(response) {
				if (response.success) {
					vm.events = response.data;
					vm.recordsData = response.data;
					$scope.$broadcast("RebuildGrid",vm.recordsData);
					vm.dataLoading = false;
				} else {
					FlashService.Error(response.message);
					vm.dataLoading = false;
				}
			});
		}

		function GetAuthenticateEventsByNoofDays(noOfDays) {
			vm.button = noOfDays;
			if (noOfDays == 7)
				vm.button = 7;
			else if (noOfDays == 15)
				vm.button = 15;
			else if (noOfDays == 30)
				vm.button = 30;

			var TotalNoOfDays = parseInt(noOfDays);
			vm.dataLoading = "Loading Events... Please wait...";
		   EventService.GetAllByNoOfDays(noOfDays, function(response) {
				if (response.success) {
					vm.events = response.data;
					vm.recordsData = response.data;
					if (vm.recordsData.length > 0) {
                        var highest = 0;
                        $.each(vm.recordsData, function (key, submittalregister) {
                            if (submittalregister.recid > highest) highest = submittalregister.recid;
                        });
                        vm.MaxId = highest;
                    }
                    else {
                        vm.MaxId = 0;
                    }
					$scope.$broadcast("RebuildGrid",vm.recordsData);
					vm.dataLoading = false;
				} else {
					FlashService.Error(response.message);
					vm.dataLoading = false;
				}

			});

		}

	}

})();
function showUserEmailClicked(email) {
	angular.element(document.getElementById('eventgrid')).scope().vm
			.showMoreUserDetails(email);
}
(function() {
	'use strict';

	angular.module('EventsApp').controller(
			'EventsManagementShowMoreUserDetailsController',
			EventsManagementShowMoreUserDetailsController);

	EventsManagementShowMoreUserDetailsController.$inject = [ '$scope',
			'$uibModalInstance', 'items' ];
	function EventsManagementShowMoreUserDetailsController($scope,
			$uibModalInstance, items) {
		$scope.user = items;
		$scope.No = function() {
			$uibModalInstance.dismiss('cancel');
		};
	}
})();
