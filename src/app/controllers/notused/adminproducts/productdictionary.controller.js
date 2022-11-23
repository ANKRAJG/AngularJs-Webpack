(function () {
    'use strict';

    angular
        .module('EventsApp')
        .controller('ProductDictionaryController', ProductDictionaryController);

    ProductDictionaryController.$inject = ['FlashService', 'ProductDictionaryService', 'AuthenticationService', '$scope'];
    function ProductDictionaryController(FlashService, ProductDictionaryService, AuthenticationService, $scope) {

        var vm = this;
        (function initController() {
            SetGridDefaults();
            LoadUserDetails();
            GetCompanyName();
            LoadSmartRegisterList();
        })();

        $scope.setGridEvents = function(event,selectionEvent,getMaxRecId) {
			$scope.gridReload = event;
			$scope.selectedGridValue = selectionEvent;
			$scope.getMaxRecId = getMaxRecId;
		}

        function SetGridDefaults() {
            vm.productdictionaryrecord = [];
            vm.MaxId = -1;
            vm.search =
                [
                	{ field: 'projectName', caption: 'Project Name', type: 'text' },
                    { field: 'divisionCode', caption: 'Division Code', type: 'text' },
                    { field: 'specSectionName', caption: 'Spec Name', type: 'text' },
                    { field: 'paraCode', caption: 'Spec sub section', type: 'text' },
                    { field: 'productDescription', caption: 'Product Description', type: 'text' },
                    { field: 'productGroup', caption: 'Product Group', type: 'text' },
                    { field: 'productSpecified', caption: 'Product Specified', type: 'text' },
                ];

            vm.columns =
                [	{ field: 'projectName', caption: 'Project Name', tooltip: 'Project Name', sortable: true, size: '8%', resizable: true, editable: false },
                	{ field: 'divisionCode', caption: 'Division Code', tooltip: 'Division Code', sortable: true, size: '4%', resizable: true, editable: false },
                    { field: 'paraCode', caption: 'Spec sub section', tooltip: 'Paragraph', sortable: true, size: '4%', resizable: true, editable: false },
                    { field: 'specSectionName', caption: 'Spec Name', sortable: true, size: '7%', resizable: true, tooltip: 'Spec Name', editable: false },
                    { field: 'productGroup', caption: 'Product Group', sortable: true, size: '8%', hidden: false, tooltip: 'Product Group', resizable: true, editable: false },
                    { field: 'productSpecified', caption: 'Product Specified', sortable: true, size: '8%', resizable: true,hidden: false, tooltip: 'Product Specified', editable: false },
                    { field: 'productDescription', caption: 'Product Description', sortable: true, size: '35%', resizable: true, tooltip: 'Product Description', editable: false },
                ];
        }

        function LoadUserDetails() {
            vm.user = AuthenticationService.GetUserInfo();
        }

        function GetCompanyName() {
            vm.companyName = AuthenticationService.GetCompanyName();
        }

        function LoadSmartRegisterList() {
            vm.dataLoading = 'Loading Product Records  ... Please wait';
            ProductDictionaryService.GetProductDictionaryRecords(function (response) {
                if (response.success) {
                    vm.MaxId = 0;
                    if(response.data){
	                    vm.productdictionaryrecord = response.data;
	                    if (vm.productdictionaryrecord.length > 0) {
	                        var highest = 0;
	                        $.each(vm.productdictionaryrecord, function (key, submittalregister) {
	                            if (submittalregister.recid > highest) highest = submittalregister.recid;
	                        });
	                        vm.MaxId = highest;
	                    }
	                    else {
	                        vm.MaxId = 0;
	                        vm.productdictionaryrecord = [];
	                    }
                    }
                    else {
                        vm.MaxId = 0;
                        vm.productdictionaryrecord = [];
                    }

                    for(var i=0;i<vm.columns.length;i++){
                		if(vm.columns[i].field === 'specNumber'){
                			vm.columns[i].editable = {type : 'combo', showAll: true , items : vm.uniqueSpecNumberUnchanged};
                		}
                	}
                    vm.originalSubmittalRegisterRecords = angular.copy(vm.productdictionaryrecord);
                    if($scope.gridReload === undefined){
                    	$scope.$broadcast("RefreshGrid", {recordsData : vm.productdictionaryrecord, columnsData : vm.columns});
                    } else{
                    	$scope.gridReload(vm.productdictionaryrecord, vm.columns);
                    }
                } else {
                    FlashService.Error(response.message);
                }
                vm.dataLoading = false;
            });
        }

    }
})();
