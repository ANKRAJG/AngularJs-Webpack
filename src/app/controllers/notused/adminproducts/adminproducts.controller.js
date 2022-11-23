(function () {
    'use strict';

    angular
        .module('EventsApp')
        .controller('AdminProductsController', AdminProductsController);

    AdminProductsController.$inject = ['$location', 'FlashService', 'ProductDataService', 'ProjectService', 'AuthenticationService', '$scope', '$routeParams', '$window', '$timeout', '$uibModal', 'MAINURL','$route','SmartRegisterService', 'ExportService', 'ModalService'];
    function AdminProductsController($location, FlashService, ProductDataService, ProjectService, AuthenticationService, $scope, $routeParams, $window, $timeout, $uibModal, MAINURL,$route,SmartRegisterService, ExportService, ModalService) {

        var vm = this;
        vm.StartNewProject = StartNewProject;
        vm.OpenNotification = OpenNotification;
        vm.RemoveFilterItem = RemoveFilterItem;
        vm.SmartRegisterChanged = false;
        vm.ContactUs = ContactUs;
        vm.Upgrade = Upgrade;
        vm.downloadType = ''; vm.FileType = -1;
        vm.Refresh = Refresh;
        vm.checkAndShowConfirmDownload = checkAndShowConfirmDownload;
        vm.NavigateToCompareVersion = NavigateToCompareVersion;
		vm.unsavedChangesTitle = 'Alert';
		vm.unsavedChangesMessage = 'You have made changes to Product Data. Please save or undo the changes before proceeding.';
		vm.Renew = Renew;
		vm.Save = Save;
		vm.EnableVersioning = EnableVersioning;
		vm.RemoveNotification = RemoveNotification;
		vm.NavigateToReplaceVersion = NavigateToReplaceVersion;
		vm.AllSectionsLabel = 'All Sections';
		vm.RevisedLabel = '_revised_';
		vm.addAllRecordsToDictionary = addAllRecordsToDictionary;
		vm.addToDictionary = addToDictionary;
		vm.removeFromDictionary = removeFromDictionary;
		vm.deleteBulkRecordsFromDictionary = deleteBulkRecordsFromDictionary;

		var items = {};
        (function initController() {
            LoadUserDetails();
            vm.loaded = 0;
            GetCompanyName();
            LoadProjects();
            GetSelectedProject();
        })();

    $scope.setGridEvents = function(event, selectionEvent, getMaxRecId, getSelectedRecords) {
			$scope.gridReload = event;
			$scope.selectedGridValue = selectionEvent;
			$scope.getMaxRecId = getMaxRecId;
			$scope.getSelectedRecords = getSelectedRecords;
		}

		function NavigateToReplaceVersion(){
        	ShowCreateProjectPopup(3,{ projectId: vm.selectedProject.projectId, isNewVersion: false, version : vm.selectedVersion, isOverride : true});
        }
		function ShowCreateProjectPopup(stepNumber,items, fromAdmin){
        	var modalInstance = $uibModal
			.open({
			    animation: true,
			    templateUrl: MAINURL + 'views/project/create.project.popup.view.html?version=9.1',
			    controller: 'CreateProjectPopUpController',
			    backdrop: 'static',
			    controllerAs: 'vm',
                bindToController: true,
			    size : 'lg',
			    windowClass : 'createProjectClass',
			    resolve: {
			    	stepNumber : function(){
			    		return stepNumber;
			    	},
			    	items : function(){
			    		return items;
			    	},
            fromAdmin: function () {
                return fromAdmin;
            }
			    }
			});

		    modalInstance.result.then(function (data) {
		    }, function () {
		    	ProjectService.GetAll(function (response) {
	                if (response.success) {
	                	vm.loaded = 2;
	                	var projects = response.data;
						vm.projects = projects.filter(function(data){
							if(data.daysToExpire <= 0){
								data.isExpired = 1;
							}
							return data;
						});
	                    LoadProjectsCallBack(vm.projects);
	                    // AuthenticationService.SetUserProjects(vm.projects);
	                } else {
	                    vm.NoProjects = true;
	                    vm.dataLoading = false;
	                }
	            });
		    });
        }

        vm.openProductPdf = function(record) {
            AuthenticationService.SetSpecViewData({ record: record });
            AuthenticationService.SetSpecViewView({ view: "ProductDataView" });
            ExportService.openNewWindow('loadspecpdf', 630, 605);
        }

        function GetProductsEnabledFlag(){
        	ProductDataService.GetProductsEnabledFlag(vm.selectedProject.projectId, function (response) {
                if (response.success) {
                	vm.isProductsEnabled = response.data;
                } else {
                    FlashService.Error(response.message);
                }
            });
        }

        function addAllRecordsToDictionary() {
        	if (!vm.dataDirty) {
	        	var records = w2ui["submittalRegisterGrid"].getSelectedRecords();
	        	if (records.length == 0) {
	        		records = w2ui["submittalRegisterGrid"].records;
	        	}
	        	vm.dataLoading = 'Adding to dictionary ... Please wait';
	        	ProductDataService.AddAllToProductDictionary(vm.selectedProject.projectId, vm.selectedVersion.versionId, records, function(response) {
	        		if (response.success) {
	        			LoadSmartRegisterList(vm.selectedProject.projectId, vm.selectedVersion.versionId);
	        		} else {
	        			vm.dataLoading = false;
	        			FlashService.Error(response.message);
	        		}
	        	});
        	} else {
        		var items = {};
        		items.message = "Please save your changes before adding the records to dictionary.";
        		items.title = "Alert";
        		ModalService.showAlertMessage(items);
        	}
        }

        function addToDictionary(recid) {
        	if (!vm.dataDirty) {
        		vm.selectedRecord = vm.submittalregisters.filter(function(data){
           	     if(data.recid === recid) return data;
           	    })[0];
        		vm.dataLoading = 'Adding to dictionary ... Please wait';
        		ProductDataService.AddToDictionary(vm.selectedProject.projectId, vm.selectedVersion.versionId, vm.selectedRecord, function(response) {
	           		if (response.success) {
	           			LoadSmartRegisterList(vm.selectedProject.projectId, vm.selectedVersion.versionId);
	           		} else {
	           			vm.dataLoading = false;
	           			FlashService.Error(response.message)
	           		}
        		});
        	} else {
        		var items = {};
        		items.message = "Please save your changes before adding the record to dictionary.";
        		items.title = "Alert";
        		ModalService.showAlertMessage(items);
        	}
        }

        function Save() {
        	vm.dataLoading = "Saving products... Please wait...";
            var changes = [];
            for (var index = 0; index < vm.submittalregisters.length ; index++) {
                var record = vm.submittalregisters[index];
                record.origProductDescription = record.productDescription;
                if (record.changes) {
                    for (var change in record.changes) {
                        record[change] = record.changes[change];
                    }
                    record.changes.action = "Update";
                }
                else {
                    record.changes = {};
                    record.changes.recid = record.recid;
                }

                if (record.isNewRecord) {
                    record.changes.action = "Added";
                }

                if (record.isDeletedRecord) {
                    record.changes.action = "Deleted";
                }

                if (record.isMergeDeletedRecord) {
                    record.changes.action = "MergeDeleted";
                }
                if (["Update", "Added", "Deleted", "MergeDeleted"].indexOf(record.changes.action) > -1) {
                    var rec = {};
                    rec.oldRecord = vm.originalSubmittalRegisterRecords.filter(function (item) { return item.recid == record.recid; })[0];
                    rec.newRecord = angular.copy(record);
                    rec.action = record.changes.action;

                    if (record.changes.action == "MergeDeleted") record.changes.action = "Deleted";
                    delete rec.newRecord.changes;
                    if (record.changes.action == "Deleted") delete rec.newRecord;

                    changes.push(rec);
                }
            }
            var endData = alasql('SELECT addedToDictionary, companyName,divisionCode,origPDFStartPageNumber,origSpecCategory,paraCode,origProductDescription,pdfEndPageNumber,pdfLineNumber,pdfPageNumber,pdfURL,projectName,projectNumber,modelNumber,recid,serialNumber,productCategory,manufacturer,smartRegisterFlag,specName,specNumber,subContractor,productDescription,productHeading,submtitalTargetGroup,targetDate,targetGroup,userNotes FROM ? WHERE isDeletedRecord <> true AND isMergeDeletedRecord <> true;', [vm.submittalregisters]);

            ProductDataService.SaveProductDictionary(vm.selectedProject.projectId,vm.selectedVersion.versionId , endData, changes, function (response) {
                if (response.success === true) {
                    $scope.$broadcast("SavedSuccess", true);
                    vm.dataDirty = false;
                    vm.dataLoading = false;
                    vm.submittalregisters = endData;
                    vm.originalSubmittalRegisterRecords = angular.copy(vm.submittalregisters);
                    Refresh();
                    vm.SmartRegisterChanged = false;
                    FlashService.Success(response.message);
                } else {
                    FlashService.Error(response.message);
                    vm.dataLoading = false;
                }
            });
        }

        function removeFromDictionary(recid) {
        	if (!vm.dataDirty) {
        		vm.dataLoading = 'Rmoving record from dictionary ... Please wait';
        		vm.selectedRecord = vm.submittalregisters.filter(function(data){
            		if (data.recid === recid) return data;
            	})[0];
            	ProductDataService.RemoveFromDictionary(vm.selectedProject.projectId, vm.selectedVersion.versionId, vm.selectedRecord, function(response) {
            		if (response.success) {
            			LoadSmartRegisterList(vm.selectedProject.projectId, vm.selectedVersion.versionId);
            		} else {
            			FlashService.Error(response.message)
            			vm.dataLoading = false;
            		}
            	});
        	} else {
        		var items = {};
        		items.message = "Please save your changes before removing the record from dictionary.";
        		items.title = "Alert";
        		ModalService.showAlertMessage(items);
        	}
        }

        function deleteBulkRecordsFromDictionary() {
        	if (!vm.dataDirty) {
        		var records = w2ui["submittalRegisterGrid"].getSelectedRecords();
	        	if (records.length == 0) {
	        		records = w2ui["submittalRegisterGrid"].records;
	        	}
	        	vm.dataLoading = 'Deleting records from dictionary ... Please wait';
	        	ProductDataService.DeleteBulkRecordsFromDictionary(vm.selectedProject.projectId, vm.selectedVersion.versionId, records, function(response) {
	        		if (response.success) {
	        			LoadSmartRegisterList(vm.selectedProject.projectId, vm.selectedVersion.versionId);
	        		} else {
	        			FlashService.Error(response.message);
	        			vm.dataLoading = false;
	        		}
	        	});
        	} else {
        		var items = {};
        		items.message = "Please save your changes before removing the records from dictionary.";
        		items.title = "Alert";
        		ModalService.showAlertMessage(items);
        	}
        }

        $scope.$watch('vm.columns', function(newCol, oldCol) {
        	AuthenticationService.SetProductDictionaryDataColumns(newCol);
        },true);

        function NavigateToCompareVersion() {
        	if(vm.selectedProject.versions.length > 1)
        		$location.path('/compareversion');
			else{
	    		var items = {};
	        	items.title = 'Alert';
	    		items.message = "Comparison requires at least two versions of the specifications. Please upload another version to use the comparison feature.";
	    		ModalService.showAlertMessage(items);
	    	}
        }

        function Refresh() {
        	vm.loaded = 2;
            LoadProjects();
            vm.dataDirty = false;
            vm.SmartRegisterChanged = false;
        }

        function showNavigateConfirmation(message,next) {
            var modalInstance = $uibModal
					.open({
					    animation: true,
					    templateUrl: MAINURL + 'views/support/support.enterpriseconfirmation.view.html?version=9.0',
					    controller: 'ConfirmUpgradeToEnterprise',
					    backdrop: 'static',
					    resolve: {
					        items: { message: message }
					    }
					});

            modalInstance.result.then(function (data) {
            	vm.dataDirty = false;
            	$location.path(next.slice(next.lastIndexOf('/')));
            }, function () {

            });
        }

        function Upgrade(projectName) {
            $scope.user = vm.user;
            var upgradeItems = PopulatingUserDetails(projectName);
            ModalService.showContactUsPopup(upgradeItems);
        }
        function NavigateToReplaceVersion(){
        	ShowCreateProjectPopup(3,{ projectId: vm.selectedProject.projectId, isNewVersion: false, version : vm.selectedVersion, isOverride : true});
        }

        $scope.$on('$locationChangeStart', function (event, next, current) {
            if (vm.dataDirty) {
            	event.preventDefault();
            	showNavigateConfirmation('You have unsaved changes. Unsaved changes will be lost if you navigate to another page. Are you sure you want to continue?', next);
            }
            AuthenticationService.SetProductDictionaryDataFilter(vm.searchData);
        });
        function ContactUs() {
            $location.path('/contactus');
        }
        $window.onbeforeunload = function (event) {
        	AuthenticationService.SetProductDictionaryDataFilter(vm.searchData);
        	AuthenticationService.SetProductDictionaryDataColumns(vm.columns);
            if (vm.dataDirty) {
                return "Your changes are not saved. Please save you changes";
            }
        };


        function SetGridDefaults() {
            vm.submittalregisters = [];
            vm.MaxId = -1;
            vm.search =
                [
                    { field: 'divisionCode', caption: 'Division', type: 'text' },
                    { field: 'specName', caption: 'Spec Name', type: 'text' },
                    { field: 'specNumber', caption: 'Spec Section', type: 'text' },
                    { field: 'paraCode', caption: 'Spec sub section', type: 'text' },
                    //{ field: 'productCategory', caption: 'Product', type: 'text' },
                    { field: 'productDescription', caption: 'Product Description', type: 'text' },
                    { field: 'productHeading', caption: 'Product Group', type: 'text' },
                    { field: 'productCategory', caption: 'Product Specified', type: 'text' },
                    /*{ field: 'modelNumber', caption: 'Model Number', type: 'text' },
                    { field: 'manufacturer', caption: 'Manufacturer', type: 'text' },*/
                ];
            var category = [
                           'Air Quality Permits', 'Allowances', 'Attic Stock', 'As-Builts', 'Basis of Design', 'Bill Of Materials', 'Calculations', 'Certificates', 'Certifications', 'Conference', 'Delegated-Design Submittal', 'Delivery Tickets', 'Design and Engineering', 'Diagrams', 'Network Diagram', 'Sprinkler Diagram', 'Wiring Diagram', 'Fabrication', 'Inventory', 'LEED Submittals', 'Manufacturers Instructions', 'Maintenance Data', 'Maintenance Service', 'Manufacturers Data', 'Manufacturers Warranty', 'Measurements', 'Meeting Minutes', 'Mix Design', 'Mockups', 'Numbering Scheme', 'O&M Training and Demonstration', 'O&M Manuals', 'Performance Data', 'Permits', 'Photometric Data', 'Photos', 'Plans', 'Product Data', 'Proposal', 'Qualification Data', 'Sample Warranty', 'Samples', 'Schedules', 'Keying Schedule', 'Product Schedule', 'Submittal Schedule', 'Shop Drawings', 'Coordination Drawings', 'Drawings', 'Templates', 'Tests and Inspections', 'Test Reports', 'Reports', 'Special Warranty', 'Valve Charts', 'Warranty', 'Waste Management Plan'
            ];
            var subHeading = [
                              'RECORD DOCUMENTS', 'RECORD DRAWINGS', 'SOFTWARE SERVICE AGREEMENT', 'WARRANTY, SERVICE, AND REPLACEMENT PARTS', 'SHOP DRAWING SUBMITTAL DATA', 'SHOP DRAWING AND SUBMITTAL DATA', 'SHOP DRAWINGS AND SUBMITTALS', 'SHOP DRAWINGS AND SUBMITTAL DATA', 'INFORMATIONAL', 'SHOP DRAWINGS', 'MAINTENANCE MATERIAL', 'MAINTENANCE MATERIALS', 'MAINTENANCE', 'GUARANTEE', 'LEED SUBMITTALS', 'MAINTENANCE MANUALS', 'MAINTENANCE SERVICE', 'INFORMATIONAL SUBMITTALS', 'SHOP DRAWINGS SUBMITTALS', 'MAINTENANCE MATERIAL SUBMITTALS', 'SUSTAINABLE DESIGN SUBMITTALS', 'QUALITY ASSURANCE', 'FIELD TESTING', 'FIELD INSPECTION', 'SYSTEM TESTING', 'FIELD QUALITY CONTROL', 'SITE QUALITY CONTROL', 'DELIVERY, STORAGE, AND HANDLING', 'DEMONSTRATION', 'EXTRA MATERIALS', 'WARRANTY', 'SUBMITTALS', 'ACTION SUBMITTALS', 'CLOSEOUT SUBMITTALS', 'OPERATION AND MAINTENANCE DATA', 'MOCK-UP'
            ];

            var specCatGrp = [
                               	'Others', 'Attic Stock', 'Certificates', 'Certifications', 'LEED', 'O&M Manuals', 'Maintenance Service', 'Product Data', 'Special Warranties', 'Mockups', 'Demonstrations', 'Sample Warranty', 'Samples', 'Schedules', 'Shop Drawings', 'Drawings', 'Tests and Inspections', 'Test Reports', 'Reports', 'General Warranties'
            ];

            var smartRegisterColumns =
                [
                     {
                         field: 'pdfPageNumber', caption: 'Spec PDF', sortable: true, size: '4%', tooltip: 'Spec Section PDF',style:'text-align:center;',
                         render: function (record) {
                             if (record.specNumber && record.serialNumber && record.pdfPageNumber && record.paraCode)
                                 return '<div><a  onclick=\'openSupportProductsPDF(' + JSON.stringify(record.recid) + ');\'><i class="spec-logo pos-b3 pos-r3" aria-hidden="true"></i><a></div>';

                             return '<div><a  onclick=\'javascript:void(0)\' disabled><i class="spec-logo pos-b3 pos-r3" aria-hidden="true"></i><a></div>';
                         }, resizable: true, editable: false
                     },
                    /*{ field: 'serialNumber', caption: 'S. No.', sortable: true, size: '3%', resizable: true, editable: false, tooltip: 'Submittal Number' },*/
                    { field: 'divisionCode', caption: 'Division', hidden: true, sortable: true, size: '7%', resizable: true, tooltip: 'Division', editable: { type: 'text' } },
                    { field: 'specNumber', caption: 'Spec Section', sortable: true, size: '6%',
                    	render: function (record) {
                    		if(record.changes && record.changes.specNumber !== undefined && record.changes.specNumber !== ''){
                    			return record.changes.specNumber;
                    		}
                    		else if (record.specNumber && record.specNumber.toLowerCase().indexOf("unknown") >= 0)
                                return 'Enter the Spec Section Number';

                    		else if (record.specNumber && record.specNumber.indexOf(vm.RevisedLabel) > -1)
                    			return record.specNumber.slice(0, record.specNumber.indexOf(vm.RevisedLabel));

                            return record.specNumber;
                        },
                        resizable: true, editable: { type: 'text' }, tooltip: 'Spec Section', },
                    { field: 'paraCode', caption: 'Spec sub section', tooltip: 'Paragraph', sortable: true, size: '4%', resizable: true, editable: { type: 'text' } },
                    { field: 'specName', caption: 'Spec Name', sortable: true, size: '7%', resizable: true, tooltip: 'Spec Name', editable: { type: 'text' } },
                    { field: 'productHeading', caption: 'Product Group', sortable: true, size: '8%', hidden: false, tooltip: 'Product Specified', resizable: true, editable: { type: 'text'} },
                    /*{ field: 'productCategory', caption: 'Product', sortable: true, hidden: true, size: '13%', resizable: true, tooltip: 'Product', editable: { type: 'text' } },*/
                    { field: 'productCategory', caption: 'Product Specified', sortable: true, size: '8%', resizable: true,hidden: false, tooltip: 'Product Specified', editable: { type: 'textarea' } },
                    { field: 'productDescription', caption: 'Product Description', sortable: true, size: '35%', resizable: true, tooltip: 'Product Description', editable: {type : 'textarea'} },
                    /*{ field: 'modelNumber', caption: 'Model Number', sortable: true, size: '6%', resizable: true, tooltip: 'Model Number', editable: { type: 'text' } },
                    { field: 'manufacturer', caption: 'Manufacturer', sortable: true, size: '6%', resizable: true, tooltip: 'Manufacturer', editable: { type: 'text' } },*/
                    { field: 'addedToDictionary', caption: 'Add/Remove Dictionary', sortable: true, size: '6%', resizable: true, tooltip: 'Add/Remove from dictionary', editable: false,
                    	render : function(record){
                    		if(record.addedToDictionary == 0)
                    			return '<div class="text-center"><label class="btn btn-sm btn-primary" title="Add to dictionary" onclick=\'rowClickedToAddRecordToDictionary('+JSON.stringify(record.recid)+');\' "><i class="fa fa-plus"></i></label></div>';
                    		else
                    			return '<div class="text-center"><label class="btn btn-sm btn-pype-orange" title="Remove from dictionary" onclick=\'rowClickedToRemoveRecordFromDictionary('+JSON.stringify(record.recid)+');\' "><i class="fa fa-minus"></i></label></div>';
                        }
                    }
                ];
            var columns = AuthenticationService.GetProductDictionaryDataColumns();
            if(columns){
            	var addToDictionaryRender = '';
            	smartRegisterColumns.forEach(function(data){
            		if(data.field === 'addedToDictionary')
            			addToDictionaryRender = angular.copy(data.render);
            	});
            	for(var i=0;i<columns.length;i++){
            		if(columns[i].field === 'addedToDictionary'){
            			columns[i].render = angular.copy(addToDictionaryRender);
            		}
            	}
            	vm.columns = columns;
            }
            else{
            	vm.columns = smartRegisterColumns;
            }
            //vm.columns = smartRegisterColumns;

            var searchData = AuthenticationService.GetProductDictionaryDataFilter();
            if(searchData){
            	vm.searchData = searchData;
            	for(var i=0;i<vm.searchData.length;i++){
            		if(vm.searchData[i].field === 'specNumber')
                		vm.selectedSpecSection = vm.searchData[i].value;
            	}
            }
            else
            	vm.searchData = [];

            vm.sortData = AuthenticationService.GetProductDictionarySortData();

            if ($routeParams.summary && $routeParams.category) {
                if ($routeParams.summary == "ProjectSubmittals") {
                    vm.searchData = [
                        { field: 'projectSummaryGroup', caption: 'Project Summary Group', value: $routeParams.category, operator: 'is', type: 'text' }
                    ];
                } else if ($routeParams.summary == "CloseoutSubmittals") {
                    vm.searchData = [
                        { field: 'projectSummaryGroup', caption: 'Project Summary Group', value: "Closeout Submittals", operator: 'is', type: 'text' },
                        { field: 'specCategoryGroup', caption: 'Spec Category Group', value: $routeParams.category, operator: 'is', type: 'text' }
                    ];
                }
                else {
                    vm.searchData = [
                        { field: 'projectSummaryGroup', caption: 'Project Summary Group', value: "Action And Informational", operator: 'is', type: 'text' },
                        { field: 'specCategoryGroup', caption: 'Spec Category Group', value: $routeParams.category, operator: 'is', type: 'text' }
                    ];
                }
            }

			$scope.$on('showSelectedRecord', function (event, data) {

	        	vm.SelectedRecord = data[0]; // Change this accordingly if we are allowing the user to make multi select
	        });

            $scope.$on('DataChanged', function (event, data) {
                vm.SmartRegisterChanged = true;
                $timeout(function () {
                    $scope.$apply(function () {
                        vm.dataDirty = true;
                    });
                });
            });

            $scope.$on('CheckIsDataDirty', function (event, data) {
            	checkAndShowConfirmDownload();
            	if(vm.dataDirty)
                    event.preventDefault();
            });


            $scope.$on('FilteredData', function (event, data) {
                vm.searchType = data.searchType;
                if (!$scope.$$phase) {
                    $scope.$apply(function () {
                        if (vm.searchType == "multi") {
                            for (var i = 0; i < data.searchData.length; i++) {
                                data.searchData[i].caption = getCaption(data.searchData[i], vm.columns);
                            }
                            vm.searchData = data.searchData;
                        }
                    });
                }
            });

            $scope.$on('SortCompleted', function (event, data) {
                $timeout(function () {
                    $scope.$apply(function () {
                        vm.sortData = data;
                        if (typeof $scope.firstTime == "undefined" || $scope.firstTime == true) {
                            FlashService.Info("To order records on multiple columns, press CTRL key and click on each column.");
                            $scope.firstTime = false;
                        }
                    });
                });
            });
        }

        function getCaption(dataItem, columns) {
            return columns.filter(function (column) {
                return column.field == dataItem.field;
            })[0].caption;
        }

        function RemoveFilterItem(index) {
        	if(vm.searchData[index].field === 'specNumber')
        		vm.selectedSpecSection = vm.AllSectionsLabel;
            vm.searchData.splice(index, 1);
            $scope.$broadcast('search', vm.searchData);
        }

        function LoadUserDetails() {
            vm.user = AuthenticationService.GetUserInfo();
        }

        function GetCompanyName() {
            vm.companyName = AuthenticationService.GetCompanyName();
        }

        $scope.$on('GetSelectedRecords', function (event, data) {
        	vm.SelectedRecords = data;
        });

        function checkAndShowConfirmDownload(){
        	if(vm.dataDirty){
        		items.title = vm.unsavedChangesTitle;
        		items.message = vm.unsavedChangesMessage;
        		ModalService.showAlertMessage(items);
        		return false;
        	}
        	return true;
        }

        function validateAndLoad(project,version) {
            if(vm.selectedProject.isExpired && !vm.user.isSuperAdmin){
            	vm.dataLoading = false;
                vm.Selectedexpired = true;
        		if (project.subscriptionStatus.toUpperCase() === 'TRIAL') {
                    showUpgradePopup(project);
                } else if(project.subscriptionStatus.toUpperCase() !== 'TRIAL'){
                	showRenewPopup(project);
                } else if(vm.isProductsEnabled === false){
                	//;
                }
        	} else {
                LoadSmartRegisterList(project.projectId,version.versionId);
            }
        }

        function showRenewPopup(project) {
            ModalService.showRenewPopup(project)
            .result.then(function(data) {
                vm.modalTitle = 'Renew Project';
                Renew(project.name);
            });
        }

        function Renew(projectName) {
            $scope.user = vm.user;
            var renewItems = PopulatingUserDetails(projectName);
            renewItems.RequestType = "Renew project for " + projectName;
            ModalService.showRenewProjectPopup(renewItems);
        }

        function showUpgradePopup(project) {
            ModalService.showUpgradePopup(project)
            .result.then(function(data) {
                vm.modalTitle = 'Upgrade Project';
                Upgrade(project.name);
            });
        }

        function GetSelectedProject() {
            var project = AuthenticationService.GetProject();
            if (project) {
                var version = AuthenticationService.GetVersion();
                returnUpdatedProject(project.projectId, function (data) {
                    vm.selectedProject = angular.copy(data);
                    if (!vm.selectedProject) {
                        $log.error("Unable to get the selected project with name : " + project.name);
                        return;
                    }
                    AuthenticationService.SetProject(vm.selectedProject);
                    if (version) {
                        vm.selectedVersion = vm.selectedProject.versions.filter(function (data) {
                            if (data.versionId === version.versionId)
                                return data;
                        })[0];
                        AuthenticationService.SetVersion(vm.selectedVersion);
                    }
                    else {
                        vm.selectedVersion = vm.selectedProject.versions[0];
                    }
                    SetGridDefaults();
                    GetProductsEnabledFlag();
                    validateAndLoad(vm.selectedProject,vm.selectedVersion);
                });
            }
        }

        function returnUpdatedProject(projectId, callback) {
            SmartRegisterService.GetProjectById(projectId, function (response) {
                if (response.success) {
                    callback(response.data);
                } else {
                    FlashService.Error(response.message);
                }
            });
        }

        function containsObject(list, property, val) {
        	if(list){
	            for (var i = 0; i < list.length; i++) {
	                if (list[i][property] === val) {
	                    return true;
	                }
	            }
        	}
            return false;
        }

        function StartNewProject() {
            $location.path('/project');
        }

        function LoadProjects() {
            vm.projects = AuthenticationService.GetUserProjects();
            if (vm.projects) {
                LoadProjectsCallBack(vm.projects);
                return;
            }
            vm.dataLoading = "Loading Build Dictionary... Please Wait";
            ProjectService.GetAll(function (response) {
                if (response.success) {
                	var projects = response.data;
					vm.projects = projects.filter(function(data){
						if(data.daysToExpire <= 0){
							data.isExpired = 1;
						}
						return data;
					});
                    LoadProjectsCallBack(vm.projects);
                    //AuthenticationService.SetUserProjects(vm.projects);
                } else {
                    vm.NoProjects = true;
                    vm.dataLoading = false;
                }

            });
        }

        function LoadProjectsCallBack(data) {
            if (vm.projects.length == 0) {
                vm.NoProjects = true;
            } else {
                vm.NoProjects = false;
                vm.dataLoading = false;
                GetSelectedProject();
            }
        }

        $scope.$on('SelectedRecordsCount', function (event, data) {
        	vm.SelectedRecordsCount = data;
        });

        function LoadSmartRegisterList(projectId,versionId) {
            vm.dataLoading = 'Loading Product Records  ... Please wait';
            ProductDataService.GetProductDataForProductDictionary(projectId,versionId, function (response) {
                if (response.success) {
                    vm.MaxId = 0;
                    if(response.data){
	                    if (response.data.searchData)
	                        vm.searchData = response.data.searchData;
	                    vm.submittalregisters = response.data.productRegisterRecords;
	                    if (vm.submittalregisters.length > 0) {
	                        var highest = 0;
	                        $.each(vm.submittalregisters,function (key, submittalregister) {
	                            if (submittalregister.recid > highest) highest = submittalregister.recid;
	                        });
	                        vm.MaxId = highest;
	                    }
	                    else {
	                        vm.MaxId = 0;
	                        vm.submittalregisters = [];
	                    }
                    }
                    else {
                        vm.MaxId = 0;
                        vm.submittalregisters = [];
                    }

                    for(var i=0;i<vm.columns.length;i++){
                		if(vm.columns[i].field === 'specNumber'){
                			vm.columns[i].editable = {type : 'combo', showAll: true , items : vm.uniqueSpecNumberUnchanged};
                		}
                	}
                    vm.originalSubmittalRegisterRecords = angular.copy(vm.submittalregisters);
                    if($scope.gridReload === undefined){
                    	$scope.$broadcast("RefreshGrid", {recordsData : vm.submittalregisters, columnsData : vm.columns});
                    } else{
                    	$scope.gridReload(vm.submittalregisters, vm.columns);
                    }
                    vm.dataLoading = false;
                } else {
                    FlashService.Error(response.message);
                    vm.dataLoading = false;
                }
            });
        }

        function PrepareUniqueSpecData(data){
        	var specData = [],specNum = '',specNumOnly = '';
        	vm.uniqueSpecNumberUnchanged = [];
        	for(var i=0;i<data.length;i++){
        		specNum = data[i].specNumber;
        		if (specNum && specNum.indexOf(vm.RevisedLabel) > -1)
    				specNum = specNum.slice(0, specNum.indexOf(vm.RevisedLabel));
        		specNum = specNum.trim();
        		specNumOnly = specNum;
        		specNum = specNum + ' - ' + data[i].specName;

        		if(specData.indexOf(specNum) === -1 && specNum !== null && specNum !== ''){
        			specData.push(specNum);
        		}
        		else if(vm.uniqueSpecNumberUnchanged.indexOf(specNumOnly) === -1 && specNumOnly !== null && specNumOnly !== ''){
        			vm.uniqueSpecNumberUnchanged.push(specNumOnly);
        		}
        	}
        	return specData;
        }

        function OpenNotification(url) {
            $window.open(url, "123", "toolbar=yes,scrollbars=yes,resizable=yes,top=50,left=350,width=600,height=600,modal=yes,alwaysRaised=yes")
        }

        function RemoveNotification(item){
        	vm.notifications[0].notifications = vm.notifications[0].notifications.filter(function(data){
        		if(data.specSectionNumber !== item.specSectionNumber)
        			return data;
        	});
        	vm.SmartRegisterChanged = true;
        	vm.dataDirty = true;
        }

        function PopulatingUserDetails(projectName) {
            var upgradeItems = {};
            upgradeItems.user = vm.user;
            upgradeItems.user.companyName = angular.copy(vm.user.company.name);
            upgradeItems.modalTitle = vm.modalTitle;

            if (projectName) {
                upgradeItems.projectName = projectName;
                upgradeItems.RequestType = "Upgrade Request for " + projectName;
            } else {
                upgradeItems.RequestType = vm.RequestType;
            }
            return upgradeItems;
        }



        function Share(project) {
            CheckIfSharingEnabled(project);
        }

        function EnableVersioning(projectName,feature){
            $scope.user = vm.user;
            var items = PopulatingUserDetails(projectName);
            if(feature == 'Version')
            	items.RequestType = "Enable Versioning for " + projectName;
            else if(feature == 'Share')
            	items.RequestType = "Enable Sharing for " + projectName;
            else if(feature == 'Products')
            	items.RequestType = "Enable Products for " + projectName;
            items.feature = feature;
            ModalService.contactUsByFeaturePopup(items);
        }

        function showContactusToBuyFeature(project,items,feature) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: MAINURL + 'views/project/project.contactustobuy.view.html',
                controller: 'UpgradeController',
                backdrop: 'static',
                resolve: {
                	items : function () { return items }
                }
            });

            modalInstance.result.then(function (data) {
                EnableVersioning(project.name, feature);
            });
        }

    }



})();

function rowClickedToAddRecordToDictionary(id) {
	angular.element(document.getElementById('productDataGrid')).scope().vm.addToDictionary(id);
}

function rowClickedToRemoveRecordFromDictionary(id) {
	angular.element(document.getElementById('productDataGrid')).scope().vm.removeFromDictionary(id);
}

(function() {
	'use strict';

	angular.module('EventsApp').controller('AdminReviewProductRecordController',
			AdminReviewProductRecordController);

	AdminReviewProductRecordController.$inject = ['$scope', '$uibModalInstance',
			'items' ];
	function AdminReviewProductRecordController($scope, $uibModalInstance, items) {
		(function() {
			$scope.totalExistedSpecCategories = [ "Mix Design", "Product Data",
					"Shop Drawings", "Certificates", "Samples" ];
			$scope.currentSpecCategories = [];
			$scope.speccategorieslist = [];
		})();
		$scope.loadSpecCategories = function ($query) {
			var totalSpecCategories = $scope.totalExistedSpecCategories;
			var values = [];
			for (var i = 0; i < totalSpecCategories.length; i++) {
				if ($scope.currentSpecCategories
						.indexOf(totalSpecCategories[i]) == -1) {
					values.push(totalSpecCategories[i]);
				}
			}
			return values
					.filter(function(user) {
						return (user.toLowerCase()
								.indexOf($query.toLowerCase()) != -1);
					});
		};
		$scope.items = angular.copy(items);
		$scope.items.record.productDescription = angular.copy(items.record.productDescription);
		$scope.items.record.projectSummaryGroup = angular
				.copy('Action and Informational');
		$scope.items.record.specCategory = angular.copy('Action Submittal');
		$scope.No = function() {
			$uibModalInstance.dismiss('cancel');
		};
		$scope.Yes = function() {

			$scope.items.record.productCategory = PrepareSpecCategoryString();
			function PrepareSpecCategoryString() {

				var specobjlist = $scope.speccategorieslist;
				var specstring = "";
				for (var index = 0; index < specobjlist.length; index++) {
					if (index == 0)
						specstring = specobjlist[index].speccategory;
					else
						specstring = specstring + ","
								+ specobjlist[index].speccategory;
				}
				return specstring;
			}
			;
			$uibModalInstance.close($scope.items.record);

		};
	}
})();

function openSupportProductsPDF(recid) {
    var record = angular.element("#wrapper").scope().vm.submittalregisters.filter(function (item) { return item.recid == recid; })[0];
    angular.element("#wrapper").scope().vm.openProductPdf(record);
}
