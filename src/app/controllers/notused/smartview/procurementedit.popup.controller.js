(function () {
    'use strict';

    angular.module('EventsApp').controller('ProcurementLogEditController', ProcurementLogEditController);

    ProcurementLogEditController.$inject = ['$scope', '$rootScope', '$uibModalInstance', 'items', 'SmartRegisterService', '$timeout', 'UtilService',
                'AuthenticationService', 'ProcurementLogService', 'FlashService', 'ModalService', '$sce', 'GlobalPropertyService'];
    function ProcurementLogEditController($scope, $rootScope, $uibModalInstance, items, SmartRegisterService, $timeout, UtilService,
            AuthenticationService, ProcurementLogService, FlashService, ModalService, $sce, GlobalPropertyService) {

        $scope.selectedVersion = AuthenticationService.GetVersion();
        var globalUISettings = GlobalPropertyService.getGlobalUISettings();
        $scope.submittalTypeList = globalUISettings['procurementlog-submittal-types'];
        //$scope.previewRowsSelected = true;

        (function () {
            $scope.step = 1;
        	$scope.project = items.project;
        	$scope.version = items.version;
        	$scope.coordinates = items.coordinates;
        	$scope.fileNamePlusSheet = items.fileNamePlusSheet;
        	$scope.selectedSheet = items.selectedSheet;
            $scope.selectedSchedule = items.selectedSchedule;
        	$scope.DEFAULT_FILENAME = "Sheet Name";
        	$scope.excelView = true;
        	$scope.TableData = "";
        	$scope.trustAsHtml = trustAsHtml;
        	Submit("PREVIEWEXCEL");
            createSpecSectionJson(items.masterSpecData);
       })();

        function trustAsHtml(tableContent){
        	return $sce.trustAsHtml(tableContent);
        }

       function createSpecSectionJson(masterSpecData) {
           $scope.specData = [];
           masterSpecData.forEach(function(item, index) {
               var tempObj = {};
               var parts = UtilService.GetSpecNumNameParts(item);
       		   if (parts && parts.length > 0) {
       			   tempObj.specNumber = angular.copy(parts[0]);
       			   tempObj.specName = angular.copy(parts[1]);
                   tempObj.specSection = item;
                   $scope.specData.push(tempObj);
       		   }
           });
       }

       $scope.openResetConfirm = function() {
           $('.modal-backdrop').show();
           var message = "Do you want to undo all changes? Changes will be ignored";
           var title = "Confirm Reset";
           ModalService.OpenConfirmModal(title, message)
           .result.then(function () {
               $scope.dataLoading = 'Loading...Please wait...';
               $timeout(function() {
                   convertHtmlTableToJson();
                   $scope.plForm.$dirty = false;
                   $scope.dataLoading = false;
               }, 200);
               $('.modal-backdrop').hide();
           }, function() {});
       }

        function Submit(type) {
        	if (type === "PREVIEWEXCEL"){
        		preparePreviewData();
        	} else {
        		$uibModalInstance.close({ type: type });
        	}
        }

        function preparePreviewData(){
    		$scope.dataLoading = "Loading... Please wait";
    		$scope.showPreview = true;
    		if ($scope.selectedSheet && $scope.selectedSheet.ocrEnabled === "true"){
    			callExtractTableForScanned(postExtractResponse);
    		} else {
    			callExtractTableForNonScanned(postExtractResponse);
    		}
        }

        function callExtractTableForScanned(callback){
        	SmartRegisterService.GetScannedTables($scope.project.projectId, $scope.version.versionId, $scope.fileNamePlusSheet, $scope.coordinates, function (response) {
        		callback(response);
            });
        }

        function callExtractTableForNonScanned(callback){
        	SmartRegisterService.GetExtractedTableExcel($scope.project.projectId, $scope.version.versionId, $scope.fileNamePlusSheet, $scope.coordinates, function (response) {
        		callback(response);
            });
        }

        function postExtractResponse(response){
			if (response && response.success) {
        		var extractedTable = response.data;
				$scope.TableData = getTableIfPresent(extractedTable);
                $timeout(function() {
                    convertHtmlTableToJson();
                    $scope.dataLoading = false;
                });
        	} else {
                convertHtmlTableToJson();
        		$scope.dataLoading = false;
        	}
        }

        function convertHtmlTableToJson() {
            var tableInArrayFormat = $('.tabula-table-container > table tr').map(function(){
                return [
                    $('td',this).map(function(){
                        return $(this).text();
                    }).get()
                ];
            }).get();

            var maxCols = getMaxNumberOfColumns(tableInArrayFormat);
            ensureArrayHasSameNoOfColumns(tableInArrayFormat, maxCols);
            createColumnCheckboxArray(maxCols);

            $scope.tableJson = [];
            tableInArrayFormat.forEach(function(item) {
                var tempArr = [];
                item.forEach(function(innerItem, idx) {
                    var tempObj = {};
                    tempObj[idx] = innerItem;
                    tempArr.push(tempObj);
                });

                $scope.tableJson.push({
                    'specData': null,
                    'descriptionArray': tempArr,
                    'selected': true
                });
            });

            if(!$scope.tableJson || $scope.tableJson.length === 0) {
                $rootScope.pLogTableExtracted = false;
            }
        }

        $scope.moveColumn = function(direction, colIndex) {
            var colToSwap = direction==='left' ? colIndex-1 : colIndex+1;
            $scope.tableJson.forEach(function(item) {
                var temp = item.descriptionArray[colIndex][colIndex];
                item.descriptionArray[colIndex][colIndex] = item.descriptionArray[colToSwap][colToSwap];
                item.descriptionArray[colToSwap][colToSwap] = temp;
            });
            $scope.plForm.$dirty = true;
        }

        $scope.clearColumnData = function(colIndex) {
            $scope.tableJson.forEach(function(item) {
                item.descriptionArray[colIndex][colIndex] = '';
            });
            $scope.plForm.$dirty = true;
        }

        $scope.deleteColumn = function(colIndex) {
        	if(!$scope.tableJson[0].descriptionArray || $scope.tableJson[0].descriptionArray.length === 1){
        		FlashService.Error("Description is required");
        		return false;
        	}
            $scope.tableJson.forEach(function(item) {
                item.descriptionArray.splice(colIndex, 1);
                item.descriptionArray = processArrayAgain(item.descriptionArray);
            });
            createColumnCheckboxArray($scope.tableJson[0].descriptionArray.length);
            $scope.plForm.$dirty = true;
        }

        function processArrayAgain(descriptionArray) {
            return descriptionArray.map(function(item, index) {
                var tempObj = {};
                for(var prop in item) {
                    if(item.hasOwnProperty(prop)){
                        tempObj[index] = item[prop];
                        break;
                    }
                }
                return tempObj;
            });
        }

        function getMaxNumberOfColumns(arr) {
            var max = 0;
            arr.forEach(function(item) {
                max = (item.length > max) ? item.length : max;
            });
            return max;
        }

        function ensureArrayHasSameNoOfColumns(arr, maxCols) {
            var diff = 0;
            arr.forEach(function(item) {
                if(item.length < maxCols) {
                    diff = maxCols - item.length;
                    for(var i=0; i<diff; i++) {
                        item.push('');
                    }
                }
            });
        }

        function createColumnCheckboxArray(maxCols) {
            $scope.colCheckboxArray = [];
            for(var i=0; i<maxCols; i++) {
                $scope.colCheckboxArray.push({selected: true});
            }
        }

       function getTableIfPresent(extractedTable){
        	if(!extractedTable) return '';
        	var tableTagIndex = extractedTable.indexOf("<table");
        	if (tableTagIndex === -1)
        		return '';
        	else{
				var tableBody = extractedTable.substring(tableTagIndex);
				if(tableBody.indexOf('<tr') === -1)
					return '';
			}
        	return extractedTable;
        }

        $scope.onSelectSpecNumberNew = function(list, specData, record, rowIndex) {
            var specCopy = angular.copy(record.specData);
			record.specData = angular.copy(specData);
            var selectedRows = list.filter(function(item) { return item.selected; });
            var firstSelectedRowIndex = getFirstSelectedRowIndex(list);
            if(rowIndex===firstSelectedRowIndex && selectedRows.length > 1 && (!specCopy || specCopy.specNumber !== specData.specNumber)) {
                $('.modal-backdrop').show();
                var message = "Do you want to apply this Spec Section on all the rows?";
                var title = "Confirmation";
                ModalService.OpenConfirmModal(title, message)
                .result.then(function () {
                    list.forEach(function(item) {
                        if(item.selected) { item.specData = angular.copy(specData); }
                    });
                    $('.modal-backdrop').hide();
                }, function() {});
            }
		}

        function getFirstSelectedRowIndex(list) {
            for(var i=0; i<list.length; i++) {
                if(list[i].selected) return i;
            }
        }

        $scope.showDisabledMsg = function(isFormInvalid, noRowsSelected) {
            if(isFormInvalid) {
                return 'Please fill all the cells in the spec section and description to enable this button.';
            } else {
                return 'Please select at least one procurement or submittal log to confirm';
            }
        }

        $scope.toggleWrapText = function() {
            $scope.wrapEnabled = !$scope.wrapEnabled;
        }

        $scope.toggleSingleLine = function() {
            $scope.singleLine = !$scope.singleLine;
            prepareLinePreviewData();
        }

        $scope.goToStep1 = function() {
            $scope.dataLoading = 'Loading...Please wait...';
            $scope.disableBtn = false;
            $timeout(function() {
                $scope.step = 1;
                $scope.dataLoading = false;
            }, 200);
        }

        $scope.goToPreview = function() {
            $scope.dataLoading = 'Loading...Please wait...';
            $timeout(function() {
                checkForReviewDisableBtn();
                $scope.step = 2;
                $scope.dataLoading = false;
            }, 200);
            preparePreviewJsonData();
            prepareLinePreviewData();
        }

        $scope.goToMultiPreview = function() {
			$scope.singleLine = false;
			$scope.goToPreview();
        }

        $scope.goToSinglePreview = function() {
			$scope.singleLine = true;
			$scope.goToPreview();
        }

		function prepareSingleLinePreviewJsonData() {
			var singleLine = {
				specData : null,
				selected : true,
				description : '',
				addToProcureLogFlag : true,
				addToSubmittalLogFlag : true,
				submittalType : 'Product Data'
			};
			$scope.multiLinePreviewData.forEach(function(line) {
				if (line.selected && line.description) {
					singleLine.description += line.description + "\n";
					if (!singleLine.specData) {
						singleLine.specData = line.specData;
						singleLine.addToProcureLogFlag = line.addToProcureLogFlag;
						singleLine.addToSubmittalLogFlag = line.addToSubmittalLogFlag;
						singleLine.submittalType = line.submittalType;
					}
				}
			});
			singleLine.description = singleLine.description.trim();
			$scope.previewJsonData = [ singleLine ];
		}

        function prepareLinePreviewData(){
            if($scope.singleLine) {
            	prepareSingleLinePreviewJsonData();
            } else {
				$scope.previewJsonData = $scope.multiLinePreviewData;
            }
        }

        function preparePreviewJsonData() {
            $scope.previewJsonData = [];
            $scope.tableJson.forEach(function(item) {
                var tempObj = {};
                tempObj.specData = item.specData;
                tempObj.selected = item.selected;
                tempObj.description = '';
                tempObj.addToProcureLogFlag = true;
                tempObj.addToSubmittalLogFlag = true;
                tempObj.submittalType = 'Product Data';

                item.descriptionArray.forEach(function(colValue, idx) {
                    if($scope.colCheckboxArray[idx].selected && colValue[idx]) {
                        tempObj.description = tempObj.description + (tempObj.description && colValue[idx].replace(/\s/g, '').length ? '; ' : '') + (colValue[idx].replace(/\s/g, '').length ? colValue[idx] : colValue[idx].replace(/\s/g, ''));
                    }
                });
                $scope.previewJsonData.push(tempObj);
            });
			$scope.multiLinePreviewData = $scope.previewJsonData;
        }

        // $scope.toggleMainPreview = function() {
        //     $scope.previewRowsSelected = !$scope.previewRowsSelected;
        //     $scope.previewJsonData.forEach(function(row) {
        //         row.selected = $scope.previewRowsSelected;
        //     });
        // }

        $scope.toggleSelection = function(arr, row) {
            if($scope.step === 2) {
                row.addToProcureLogFlag = row.selected;
                row.addToSubmittalLogFlag = row.selected;
            }
            $scope.disableBtn = false;
            if(!row.selected) {
                for(var i=0; i<arr.length; i++) {
                    if(arr[i].selected) { return; }
                }
                $scope.disableBtn = true;
            }
        }

        $scope.togglePSCheckbox = function(row, flag) {
            row[flag] = !row[flag];
            checkForReviewDisableBtn();
        }

        function checkForReviewDisableBtn() {
            $scope.disableBtn = false;
            var goodToGo = false;
            for(var i=0; i<$scope.previewJsonData.length; i++) {
                if($scope.previewJsonData[i].selected && ($scope.previewJsonData[i].addToProcureLogFlag || $scope.previewJsonData[i].addToSubmittalLogFlag)) {
                    goodToGo = true;
                }
            }
            if(!goodToGo) { $scope.disableBtn = true; }
        }

        $scope.removeSpecSection = function(row) {
            if(row.selected) {
                row.specData.specSection = '';
            }
        }

        $scope.closeAndOpenPlTab = function() {
            $scope.dataLoading = "Saving...Please wait..";
            var requestData = prepareRequestData();
            ProcurementLogService.saveProcurementLogs($scope.selectedVersion.versionId, requestData, function(response) {
                if(response.success) {
                    FlashService.Success('Successfully added to Procurement Log');
                    $uibModalInstance.close(response.data.records);
                } else {
                    FlashService.Error('Failed to add to Procurement Log');
                }
                $scope.dataLoading = false;
            });
        }

        function prepareRequestData() {
            var requestData = [];
            $scope.previewJsonData.forEach(function(item) {
                if(item.selected) {
                    var tempObj = {}, mainObj = {};
                    tempObj.specNumber = item.specData.specNumber;
                    tempObj.specName = item.specData.specName;
                    tempObj.scheduleUid = $scope.selectedSchedule.uuid;
                    tempObj.scheduleName = $scope.selectedSchedule.scheduletitle;
                    tempObj.pdfFileName = $scope.selectedSheet.filename;
                    tempObj.pdfPageNumber = $scope.selectedSheet.pagenumber_i;
                    tempObj.sheetNumber = $scope.selectedSheet.pagelabel_s;
                    tempObj.sheetName = $scope.selectedSheet.pagename_s;
                    tempObj.coordinates = $scope.coordinates;
                    tempObj.description = item.description;
                    tempObj.addedToSmartRegister = '';
                    tempObj.submittalTypes = [item.submittalType];

                    mainObj = { record: tempObj, 'actions': [] };
                    if(item.addToProcureLogFlag) {
                        mainObj.actions.push('CREATE');
                    }
                    if(item.addToSubmittalLogFlag) {
                        mainObj.actions.push('ADD_TO_SMARTREGISTER');
                    }
                    if(item.addToProcureLogFlag || item.addToSubmittalLogFlag) {
                        requestData.push(mainObj);
                    }
                }
            });
            return requestData;
        }

        $scope.Cancel = function () {
            if($scope.tableJson.length>0) {
                $('.modal-backdrop').show();
                var message = 'You have unsaved changes that will be lost if you decide to continue. <br> <b> Are you sure you want to quit this popup? </b>';
    			ModalService.OpenConfirmModal('Confirmation', message)
    			.result.then(function () {
                    $uibModalInstance.close();
                    $('.modal-backdrop').hide();
                }, function() {});
            } else {
                $uibModalInstance.close();
            }
        };
    }

})();
