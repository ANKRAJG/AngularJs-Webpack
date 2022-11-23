(function () {
	'use strict';

	angular.module('EventsApp').controller('CreateAddendumCtrl', CreateAddendumCtrl);

	CreateAddendumCtrl.$inject = ['$scope', 'AddendumService', 'FlashService', 'AuthenticationService', 'ModalService', '$location',
		'$timeout', 'RESPONSE_CODES', 'EventService', '$uibModal', 'MAINURL', 'ExportService', 'SmartRegisterService', '$route',
		'DownloadService', 'ACC_PROJECTS_URL', 'UtilService'];
	function CreateAddendumCtrl($scope, AddendumService, FlashService, AuthenticationService, ModalService, $location,
		$timeout, RESPONSE_CODES, EventService, $uibModal, MAINURL, ExportService, SmartRegisterService, $route,
		DownloadService, ACC_PROJECTS_URL, UtilService) {

		var vm = this;
		vm.user = AuthenticationService.GetUserInfo();
		vm.project = AuthenticationService.GetProject();
		vm.selectedVersion = AuthenticationService.GetVersion();
		vm.accProject = AuthenticationService.GetACCProject();
		vm.lastRoute = AuthenticationService.GetLastRoute();
		vm.selectedVersionAddendum = AuthenticationService.GetVersionAddendum();
		// currently uploaded files size in GB.
        vm.totalFileSize = 0;
        // This is the total size of files user is allowed to upload in GB, currently set to 1GB,
        vm.maxFileSizeLimit = 1;
		vm.invalidFiles = [];

		/* ----------------- FUNCTIONS ------------------- */
		vm.validate = validate;
		vm.generateSubmittals = generateSubmittals;
		/* ----------------- END OF FUNCTIONS ------------------- */

		vm.backToAddendum = backToAddendum;


        (function initController() {
			vm.step = 2.1;	// Goto step 2.1, Directly to Upload specs flow
			if(!vm.accProject) {
				window.location.href = ACC_PROJECTS_URL;
			}
			$scope.namePattern = /^[^/\\;:%\^\#\'\"]*$/;
			vm.hasDocsEnabled = vm.accProject.products && vm.accProject.products.filter(function(product) {
				return product.key.toLowerCase() === 'docs';
			}).length>0;
        })();

		vm.browseDocFilesPopup = function() {
			UtilService.browseDocFilesPopup($scope);
		}

		vm.close = function() {
			if(vm.step < 6 && vm.selectedVersionAddendum.status.toLowerCase() !== 'failed') {
				var items = { 'message': '' };
				if(!vm.generationStarted && vm.filesList && vm.filesList.length>0) {
					items.message = 'All files in the list will be removed and all progress will be lost. ';
				}
				items.message = items.message + "Your addendum has not been created yet."  + " Cancelling will discard your addendum and exit the addendum creation process.";

				ModalService.cancelUploadSpecsPopup(items).result.then(function() {
					$timeout.cancel(vm.timerForAddendumRun);
					$location.path(vm.lastRoute);
				}, function() {});
			} else {
				$location.path(vm.lastRoute);
			}
		}

		vm.contactSupport = function() {
			window.solvvyApi.open();
		}

		$scope.$on('specsAddedToList', function(event, value){
          vm.specsAddedToList = value;
          apply();
        });

		$scope.$on('uploadingStarted', function(event, value){
          vm.uploadingStarted = value;
          apply();
        });

		$scope.$on('disableBtnFlag', function(event, value){
          vm.disableBtnFlag = value;
          apply();
        });

		$scope.$on('removeRetryBtn', function(event, value){
          vm.removeRetryBtn = value;
          apply();
        });

		function apply() {
			if(!$scope.$$phase) {
			    $scope.$apply();
			}
		}

		vm.errorFileCheck = function(isErrorFileExists){
        	vm.errorFileExists = isErrorFileExists;
        }

		vm.checkFileLimit = function(totalFileSize){
        	totalFileSize = (totalFileSize*1000)/1024; //converting to 1024 base to convert to GB.
        	vm.totalFileSize = Math.round(totalFileSize/10)/100;
        	if(vm.totalFileSize > vm.maxFileSizeLimit){
        		vm.maxFileLimitReached = true;
        	} else {
        		vm.maxFileLimitReached = false;
        	}
        }

		function validate() {
			vm.validating = 'Validating...Please wait...';
            AddendumService.CheckStatus(vm.selectedVersionAddendum.addendumId, function (response) {
				runValidations(response);
				vm.uploadingStarted = false;
				$scope.$broadcast('validationDone', true);
            });
        }

		function checkForValidations(validatedData) {
			vm.step = 2.3;
			$scope.$broadcast('validationError', validatedData);
			return true;
		}

		function runValidations(response) {
			var validationObj = {
				invalidFiles: vm.invalidFiles,			// Reference to vm.invalidFiles
				filesList: vm.filesList,		// Reference to vm.filesList
				checkForValidations: checkForValidations		// Reference to Function
			};

			// Moved this function (runSpecValidations) to a common Service as it is used in Upload Specs as well.
			UtilService.runSpecValidations(response, validationObj);
			vm.errorMessage = validationObj.errorMessage;
			vm.disableBtnFlag = validationObj.disableBtnFlag;
			vm.specsAddedToList = validationObj.specsAddedToList;
			vm.validating = false;
		}

		vm.retry = function() {
			$scope.$broadcast('retrySpecsUpload');
		}

		function generateSubmittals() {
			vm.step = 4.1;
			vm.generationStarted = true;
            AddendumService.RunSpecs(vm.selectedVersionAddendum.addendumId, function (response, status) {
            	if(status === -1){
            		vm.step = 4.5;
                    EventService.LogTimeoutEvent(vm.project.projectId, vm.selectedVersion.versionId, function (response) {
                    	if(response.success){
                    		console.log('Logged timeout event');
                    	} else{
                    		console.log('Unable to log timeout event');
                    	}
                    });
            	}
            	else if (response.success) {
            		if(response.data) {
            			if(response.data.status.toLowerCase() === 'in progress'){
							getUpdatedAddendumStatus();
            			} else {
							validateAddendumData(function() {
								vm.step = 5;
							});
            			}
            		}
            		else{
            			FlashService.Error('Couldn\'t fetch data from server');
            		}
                } else {
                    vm.step = 4.4;
                    FlashService.Error(response.message);
                }
            });
		}

		function getUpdatedAddendumStatus() {
			getAddendumStatus(function(addendum) {
				if(addendum.status.toUpperCase() === 'COMPLETED') {
					validateAddendumData(function() {
						vm.step = 5;
					});
				} else if(addendum.status.toUpperCase() === 'FAILED') {
					vm.step = 4.4;
				} else if(addendum.status.toUpperCase() === 'IN PROGRESS') {
					vm.timerForAddendumRun = $timeout(function() {
						// Running this after 5 secs
						getUpdatedAddendumStatus();
					}, 5000);
				}
			});
		}

		function getAddendumStatus(callback) {
        	AddendumService.getAddendumById(vm.selectedVersionAddendum.addendumId, function(response) {
        		if (response.success) {
					vm.selectedVersionAddendum = response.data;
					if(callback) callback(response.data);
        		} else {
        			console.log("Failed to validate the data");
        		}
        	});
		}

		function validateAddendumData(callback) {
        	var addendumId = vm.selectedVersionAddendum.addendumId;
        	AddendumService.ValidateAddendumData(addendumId, function(response) {
        		if (response.success) {
					vm.addendumData = response.data;
					prepareColumns();
        			buildGrid(response.data, vm.columns11, vm.columns12);
					if(callback) callback();
        		} else {
        			console.log("Failed to validate the data");
        		}
        	});
        }

        function backToAddendum() {
       	 vm.step = 2.2;
        }

		function prepareColumns() {
        	vm.columns11 = [
				{
					name : 'appendFlag',
					width : 95,
					headerTooltip : true,
					headerCellTemplate: '<div class="ui-grid-cell-contents text-center"><input type="checkbox"  ng-click="grid.appScope.selectAll(\'append\', \'replace\')" name="checkbx" ng-checked="grid.appScope.appendAllSelected"> Append</div>',
					cellTemplate : '<div class="ui-grid-cell-contents text-center"><span ng-attr-title="{{!row.entity.specSectionAddendum ? \'Append not applicable\':\'Append Spec\'}}"><input class="checkboxAddendum" style="width:16px;height:16px;margin-left:3px;margin-top:3px;cursor:pointer;" type="checkbox" ng-if="row.entity.specSectionAddendum" ng-model="row.entity.appendFlag" ng-click="grid.appScope.appendReplaceClicked(row.entity, \'append\', \'replace\')" ng-checked="row.entity.appendFlag" name="checkbx"></span></div>'
				}, {
					name : 'replaceFlag',
					width : 95,
					headerTooltip : true,
					headerCellTemplate: '<div class="ui-grid-cell-contents text-center"><input type="checkbox"  ng-click="grid.appScope.selectAll(\'replace\', \'append\')" name="checkbx" ng-checked="grid.appScope.replaceAllSelected"> Replace</div>',
					cellTemplate : '<div class="ui-grid-cell-contents text-center"><span ng-attr-title="{{!row.entity.specSectionAddendum ? \'Replace not applicable\':\'Replace Spec\'}}"><input class="checkboxAddendum" style="width:16px;height:16px;margin-left:3px;margin-top:3px;cursor:pointer;" type="checkbox" ng-if="row.entity.specSectionAddendum" ng-model="row.entity.replaceFlag" ng-click="grid.appScope.appendReplaceClicked(row.entity, \'replace\', \'append\')" ng-checked="row.entity.replaceFlag" name="checkbx"></span></div>'
				}, {
					name : 'pdfFlag',
					displayName : 'Spec PDF',
					width : 85,
					headerTooltip : true,
					cellTemplate : '<div class="ui-grid-cell-contents text-center"><a title="Addendum PDF" ng-if="row.entity.specSectionAddendum" ng-click="grid.appScope.addendumPdfClicked(row.entity);">'
						+ '<i class="spec-logo pos-l3"></i></a></div>'
				}, {
					name : 'specSectionAddendum',
					displayName : 'Spec section',
					width : 130,
					headerTooltip : true,
					cellTemplate : '<div ng-class="{\'yellowBackground\': row.entity.specSectionAddendum && row.entity.specSectionVersion, \'redBackground\': row.entity.specSectionAddendum && !row.entity.specSectionVersion}" class="ui-grid-cell-contents"><span title="{{row.entity.specSectionAddendum}}" ng-if="row.entity.specSectionAddendum">{{row.entity.specSectionAddendum}}</span></div>'
				}, {
					name : 'specNameAddendum',
					displayName : 'Spec name',
					width : 400,
					headerTooltip : true,
					cellTemplate : '<div class="ui-grid-cell-contents"><span title="{{row.entity.specNameAddendum}}" ng-if="row.entity.specNameAddendum">{{(row.entity.specNameAddendum.toUpperCase() === "ENTER THE SPEC SECTION NAME" || row.entity.specNameAddendum == "") ? \'Unknown\' : row.entity.specNameAddendum}}</span></div>'
				}
			];

			vm.columns12 = [
				{
					name : 'pdfFlag',
					displayName : 'Spec PDF',
					width : 85,
					headerTooltip : true,
					cellTemplate : '<div class="ui-grid-cell-contents text-center"><a title="Version PDF" popover-append-to-body="true" popover-class="specPdfPopoverClass" ng-if="row.entity.specSectionVersion" ng-click="grid.appScope.specSectionSubPdfPopover.open(row.entity)"'
						+ 'uib-popover-template="\'viewPDFsPopover.html\'" popover-is-open="grid.appScope.specSectionSubPdfPopover.isOpen && grid.appScope.specSectionSubPdfPopover.isOpen[row.entity.specSectionVersion]" popover-placement="right" popover-title="Select PDF" popover-trigger="none">'
						+ '<i class="spec-logo pos-l3"></i></a></div>'
				}, {
					name : 'specSectionVersion',
					displayName : 'Spec section',
                    width : 130,
					headerTooltip : true,
					cellTemplate : '<div class="ui-grid-cell-contents"><span title="{{row.entity.specSectionVersion}}" ng-if="row.entity.specSectionVersion">{{row.entity.specSectionVersion}}</span></div>'
				}, {
					name : 'specNameVersion',
					displayName : 'Spec name',
					width : 400,
					headerTooltip : true,
					cellTemplate : '<div class="ui-grid-cell-contents"><span title="{{row.entity.specNameVersion}}" ng-if="row.entity.specNameVersion">{{(row.entity.specNameVersion.toUpperCase() === "ENTER THE SPEC SECTION NAME" || row.entity.specNameVersion == "") ? \'Unknown\' : row.entity.specNameVersion}}</span></div>'
				}
			];

			vm.columns21 = [
				{
					name : 'appendFlag',
					width : 95,
					headerTooltip : true,
					headerCellTemplate: '<div class="ui-grid-cell-contents text-center"><input type="checkbox" name="checkbx" ng-disabled="true"  ng-checked="grid.appScope.appendAllSelected"> Append</div>',
					cellTemplate : '<div class="ui-grid-cell-contents text-center"><span ng-attr-title="{{!row.entity.specSectionAddendum ? \'Append not applicable\':\'Append Spec\'}}"><input style="width:16px;height:16px;margin-left:3px;margin-top:3px;cursor:pointer;" type="checkbox" ng-if="row.entity.specSectionAddendum" ng-model="row.entity.appendFlag" ng-disabled="true" ng-checked="row.entity.appendFlag===1" name="checkbx"></span></div>'
				}, {
					name : 'replaceFlag',
					width : 95,
					headerTooltip : true,
					headerCellTemplate: '<div class="ui-grid-cell-contents text-center"><input type="checkbox" name="checkbx" ng-disabled="true" ng-checked="grid.appScope.replaceAllSelected"> Replace</div>',
					cellTemplate : '<div class="ui-grid-cell-contents text-center"><span ng-attr-title="{{!row.entity.specSectionAddendum ? \'Replace not applicable\':\'Replace Spec\'}}"><input style="width:16px;height:16px;margin-left:3px;margin-top:3px;cursor:pointer;" type="checkbox" ng-if="row.entity.specSectionAddendum" ng-model="row.entity.replaceFlag" ng-disabled="true" ng-checked="row.entity.replaceFlag===1" name="checkbx"></span></div>'
				}, {
					name : 'pdfFlag',
					displayName : 'Spec PDF',
					width : 85,
					headerTooltip : true,
					cellTemplate : '<div class="ui-grid-cell-contents text-center"><a title="Addendum PDF" ng-if="row.entity.specSectionAddendum" ng-click="grid.appScope.addendumPdfClicked(row.entity);">'
						+ '<i class="spec-logo pos-l3"></i></a></div>'
				}, {
					name : 'specSectionAddendum',
					displayName : 'Spec section',
					width : 130,
					headerTooltip : true,
					cellTemplate : '<div class="ui-grid-cell-contents"><span title="{{row.entity.specSectionAddendum}}" ng-if="row.entity.specSectionAddendum">{{row.entity.specSectionAddendum}}</span></div>'
				}, {
					name : 'specNameAddendum',
					displayName : 'Spec name',
					width : 400,
					headerTooltip : true,
					cellTemplate : '<div class="ui-grid-cell-contents"><span title="{{row.entity.specNameAddendum}}" ng-if="row.entity.specNameAddendum">{{(row.entity.specNameAddendum.toUpperCase() === "ENTER THE SPEC SECTION NAME" || row.entity.specNameAddendum == "") ? \'Unknown\' : row.entity.specNameAddendum}}</span></div>'
				}
			];

			vm.columns22 = [
				{
					name : 'pdfFlag',
					displayName : 'Spec PDF',
					width : 85,
					headerTooltip : true,
					cellTemplate : '<div class="ui-grid-cell-contents text-center"><a title="Version PDF" popover-append-to-body="true" popover-class="specPdfPopoverClass" ng-if="row.entity.specSectionVersion" ng-click="grid.appScope.specSectionSubPdfPopover.open(row.entity)"'
						+ 'uib-popover-template="\'viewPDFsPopover.html\'" popover-is-open="grid.appScope.specSectionSubPdfPopover.isOpen && grid.appScope.specSectionSubPdfPopover.isOpen[row.entity.specSectionVersion]" popover-placement="right" popover-title="Select PDF" popover-trigger="none">'
						+ '<i class="spec-logo pos-l3"></i></a></div>'
				}, {
					name : 'specSectionVersion',
					displayName : 'Spec section',
	                width : 130,
					headerTooltip : true,
					cellTemplate : '<div ng-class="{\'greenBackground\': row.entity.specSectionAddendum && row.entity.action==\'A\', \'violetBackground\': row.entity.specSectionVersion && row.entity.action==\'R\'}" class="ui-grid-cell-contents"><span title="{{row.entity.specSectionVersion}}" ng-if="row.entity.specSectionVersion">{{row.entity.specSectionVersion}}</span></div>'
				}, {
					name : 'specNameVersion',
					displayName : 'Spec name',
					width : 400,
					headerTooltip : true,
					cellTemplate : '<div class="ui-grid-cell-contents"><span title="{{row.entity.specNameVersion}}" ng-if="row.entity.specNameVersion">{{(row.entity.specNameVersion.toUpperCase()==="ENTER THE SPEC SECTION NAME" || row.entity.specNameVersion == "") ? \'Unknown\' : row.entity.specNameVersion}}</span></div>'
				}
			];
        }

		$scope.selectAll = function(type1, type2) {
			var ifOneSelected = false;
			$scope[type1 + 'AllSelected'] = angular.copy(!$scope[type1 + 'AllSelected']);
			if($scope[type2 + 'AllSelected']) {
				$scope[type2 + 'AllSelected'] = false;
			}
			vm.addendumData.forEach(function(item) {
				item[type1 + 'Flag'] = $scope[type1 + 'AllSelected'];
				item[type2 + 'Flag'] = $scope[type2 + 'AllSelected'];
				ifOneSelected = item.appendFlag || item.replaceFlag;
			});
			$("#btnAppendOrReplace").attr("disabled", !ifOneSelected);
		}

        $scope.appendReplaceClicked = function(record, type1, type2) {
			var allselected = true;
			record[type1 + 'Flag'] = !record[type1 + 'Flag'];
        	if (record[type2 + 'Flag']) {
        		record[type2 + 'Flag'] = false;
        	}
			if(record[type1 + 'Flag']) {
				$scope[type2 + 'AllSelected'] = false;
				vm.addendumData.forEach(function(item) {
					if(item.specSectionAddendum && !item[type1 + 'Flag']) {
						allselected = false;
					}
				});
				$scope[type1 + 'AllSelected'] = allselected;
			} else {
				$scope[type1 + 'AllSelected'] = false;
			}
        	$("#btnAppendOrReplace").attr("disabled", !$(".checkboxAddendum").is(":checked"));
        }

		$scope.addendumPdfClicked = function(record) {
			var recordCopy = angular.copy(record);
			recordCopy.specNumber = record.specSectionAddendum;
			AuthenticationService.SetGenericRecordData({ record: recordCopy });
			ExportService.openNewWindow('loadspecpdf?addendum=' + vm.selectedVersionAddendum.addendumId, 630, 605, 50);
		}

		function buildGrid(data, columns1, columns2) {
			var getCellTemplate = function(record) {
				if (record.specNumber && record.specNumber.indexOf('_revised_') > -1) {
					var specNumber = record.specNumber.slice(0, record.specNumber.indexOf('_revised_'));
					return '<div class="ui-grid-cell-contents"><span>{{specNumber}}</span></div>';
				}
				return '<div class="ui-grid-cell-contents"><span>{{record.specNumber}}</span></div>';
			};

			$scope.gridOptions1 = {
				data : data,
				columnDefs : columns1,
				enableColumnMenus : false,
				rowTemplate : '<div ng-click="grid.appScope.rowClicked(row,col,colRenderIndex)" ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid" class="ui-grid-cell" ui-grid-cell></div>',
			};

			$scope.gridOptions2 = {
				data : data,
				columnDefs : columns2,
				enableColumnMenus : false,
				rowTemplate : '<div ng-click="grid.appScope.rowClicked(row,col,colRenderIndex)" ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid" class="ui-grid-cell" ui-grid-cell></div>',
			};
		}

		$scope.rowClicked = function(row, col, ind) {
			$scope.clickedRecord = row.uid;
			if (col.field === "specSectionAddendum" || col.field === "specNameVersion" ||
					col.field === "specSectionVersion" || col.field === "specNameAddendum") {
				getDiffData(row.entity);
			}
		}

		function getDiffData(row){
        	var specSection = '';
        	if(row.specSectionVersion){
        		specSection = row.specSectionVersion;
        	} else if(row.specSectionAddendum){
        		specSection = row.specSectionAddendum;
        	} else {
        		$log.error('Unable to get spec section number from selected row : ' + row);
        		FlashService.Error('Internal Error! Unable to fetch the data');
        		return;
        	}
			vm.dataLoading = 'Please wait...';
        	AddendumService.GetAddendumDiffData(vm.selectedVersionAddendum.addendumId, vm.selectedVersion.versionId, specSection, function(response) {
				if (response.success) {
					if (response.data && response.data.submittalRecords && response.data.submittalRecords.length > 0) {
					    var data = response.data.submittalRecords;
						data.forEach(function(item, idx) {
							item.id = idx;
						});
                        showSpecSectionDifferencesPopup(row, data);
					}
				} else {
					FlashService.Error(response.message);
				}
				vm.dataLoading = false;
			});
		}

		function showSpecSectionDifferencesPopup(row, data){
        	var items = {
    			specNumber : row.specSectionVersion,
    			version : vm.selectedVersion,
    			addendum : vm.selectedVersionAddendum,
    			projectId : vm.project.projectId,
    			data : data
        	};

        	var modalInstance2 = $uibModal.open({
                animation: true,
                size: 'xl',
                templateUrl: MAINURL + 'views/addendum/compare.specsectionsubmittals.view.html?version=9.0',
                controller: 'CompareSpecSectionSubmittalsController',
                backdrop: 'static',
                resolve: {
                    items : function () { return items; }
                }
            });
        }

		$scope.specSectionSubPdfPopover = {
	        templateUrl: 'viewPDFsPopover.html',
	        open: function(record) {
	        	$scope.specSectionSubPdfPopover.isOpen = false;
	        	populateSpecPDFsDataForPopup(record, vm.selectedVersion, vm.project, 'versionWindow', 650, function() {
	                if(vm.pdfData.length > 1) {
	                	$scope.specSectionSubPdfPopover.isOpen = {};
	                	$scope.specSectionSubPdfPopover.isOpen[record.specSectionVersion] = true;
	                	$scope.specSectionSubPdfPopover.data = vm.pdfData;
	                } else {
						var recordCopy = angular.copy(record);
						recordCopy.specNumber = record.specSectionVersion;
						DownloadService.openSpecPdf(recordCopy, 650);
	                }
	            });
	        }
        };

		$scope.showVersionSpecSubPdf = function(record, sourceId) {
			var recordCopy = angular.copy(record);
			recordCopy.specNumber = record.specSectionVersion;
			recordCopy.sourceId = sourceId;
			DownloadService.openSpecPdf(recordCopy, 650);
		}

        //Get all PDFs for a specsection using this function.
        function populateSpecPDFsDataForPopup(record, version, project, windowName, left, callback) {
        	var projectId = project.projectId;
        	var versionId = version.versionId;
        	var specCode = record.specSectionVersion;
        	var pdfData = [];
        	SmartRegisterService.getMultipleSpecDetails(projectId, versionId, specCode, function(response) {
                if(response.success) {
                    var data = response.data;
                    for(var i=0;i<data.length;i++) {
                    	var obj = { 'record': record, 'sourceId': data[i].sourceId, 'sourceName': data[i].sourceName };
                    	pdfData.push(obj);
                    }
                    vm.pdfData = pdfData;
                    if(callback) { callback(); }
                } else {
                	FlashService.Error(response.data);
                }
            });
        }

		vm.confirmAppendReplace = function() {
			var bodyMsg = 'Changes are automatically saved to Submittal Register. Are you sure you want to perform the selected actions?';
            ModalService.OpenConfirmModal('Confirm changes', bodyMsg, false, 'Confirm', 'Cancel')
        	.result.then(function () {
          		mergeAddendumWithVersion();
        	}, function() {});
        }

		function mergeAddendumWithVersion() {
        	vm.dataLoading = 'Appending/Replacing Addendum Specs to destination Version in progress, Please Wait...';
        	var addendumDetails = [];
        	for (var i = 0; i < vm.addendumData.length; i++) {
        		var addendumData = angular.copy(vm.addendumData[i]);
        		if (addendumData.specSectionAddendum) {
        			addendumData.appendFlag = addendumData.appendFlag ? 1 : 0;
        			addendumData.replaceFlag = addendumData.replaceFlag ? 1 : 0;
        		} else {
					addendumData.appendFlag = 0;
					addendumData.replaceFlag = 0;
				}
        		addendumDetails.push(addendumData);
        	}
        	var addendum = AuthenticationService.GetVersionAddendum();
        	AddendumService.MergeAddendumWithVersion(addendum.addendumId, addendumDetails, function(response){
        		if (response.success) {
        			buildGrid(response.data, vm.columns21, vm.columns22);
        			vm.step = 6;
					FlashService.Success(addendum.name + ' is successfully completed.');
        		} else {
        			FlashService.Error(response.message);
        		}
				vm.dataLoading = false;
        	});
        }

		vm.smartRegister = function() {
			var existingFilter = AuthenticationService.UpdateFilterDataAccordingToFormat([]);
            existingFilter = AuthenticationService.UpdateFilterDataWithNewValuesAndVisibility(existingFilter, []);
            AuthenticationService.SetAdditionalFilters({ field: 'all', value: vm.selectedVersionAddendum.name});
			AuthenticationService.SetSmartRegisterFilter(existingFilter);
            AuthenticationService.SetShowSaveSmartRegisterFilter(true);
			$location.path('/smartregister/projects/' + vm.accProject.id);
		}

		$(document).click(function(e) {
            var container = $('.specPdfPopoverClass');
            if (container && container.length > 0 && container.has(e.target).length === 0) {
              $scope.specSectionSubPdfPopover.isOpen = {};
              $scope.$apply();
            }
        });

	}
})();
