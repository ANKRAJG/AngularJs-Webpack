
(function () {
    'use strict';

    angular
        .module('EventsApp')
        .controller('MergeModalInstanceCtrl', MergeModalInstanceCtrl);

    MergeModalInstanceCtrl.$inject = ['$scope', '$uibModalInstance', 'recordData','$uibModal', 'MAINURL', 'AuthenticationService', 'fromRegister', 'submittalProductVar', 'fromProducts', 'FlashService','SanitizationService'];
    function MergeModalInstanceCtrl($scope, $uibModalInstance, recordData, $uibModal, MAINURL, AuthenticationService, fromRegister, submittalProductVar, fromProducts, FlashService,SanitizationService) {

    	var vm = this;
    	vm.recordSelected = recordSelected;
    	vm.mergeRecords = mergeRecords;
    	vm.gotoIntroScreen = gotoIntroScreen;
    	vm.gotoMainScreen = gotoMainScreen;
    	vm.backButtonClicked = backButtonClicked;


    	var columnsData1 = {};
    	vm.mappingObj = {};
    	vm.popoverIsOpen = false;
        vm.fromRegister = fromRegister;
        vm.submittalProductVar = submittalProductVar;
        vm.fromProducts = fromProducts;

        (function () {
            $scope.StepsLoaded = [];
            $scope.recordsData = getDecodedRecordData(recordData);
            vm.recordsToDisplay = PrepareRecordsAccordingToDisplay(recordData);
            decodeDescription();
            vm.dontShowMeAgain = AuthenticationService.GetDontShowMergeIntroFlag();
            if(vm.dontShowMeAgain){
            	vm.Step = 1;
            } else {
            	vm.Step = 0;
            }
        })();

        function decodeDescription() {
            vm.recordsToDisplay.forEach(function(item) {
                item.records.forEach(function(item2) {
                    item2.description = SanitizationService.decode(item2.description);
                });
            });
        }

        function getDecodedRecordData(recordData) {
            recordData.forEach(function(item) {
                item.submittalDescription = SanitizationService.decode(item.submittalDescription);
            });
            return recordData;
        }

        function gotoMainScreen(){
        	AuthenticationService.SetDontShowMergeIntroFlag(vm.dontShowMeAgain);
        	vm.Step = 1;
        }

        function getTempChangesObj(record, tempObj){
    			  if(record.changes[vm.submittalProductVar]){
    				   tempObj.description = record.changes[vm.submittalProductVar];
        		}
        		if(record.changes.specNumber){
        			tempObj.specNumber = record.changes.specNumber;
        		}
        		if(record.changes.specName){
        			tempObj.specName = record.changes.specName;
        		}
        		if(record.changes.paraCode){
        			tempObj.paraCode = record.changes.paraCode;
        		}
        		if(record.changes.specCategory){
        			tempObj.specCategory = record.changes.specCategory;
        		}
        		return tempObj;
        }

        function PrepareRecordsAccordingToDisplay(records){
        	var recordsToBeShown = [];
        	var tempChangesObj = {}, record, numOfSpecSections = 0, existingSpecs = [], currentSpecIndex = -1, item = {};
        	for(var i=0;i<records.length;i++){
        		currentSpecIndex = -1;
        		record = records[i];
        		tempChangesObj.specNumber = record.specNumber;
        		tempChangesObj.specName = record.specName;
        		tempChangesObj.description = record[vm.submittalProductVar];
        		tempChangesObj.paraCode = record.paraCode;
        		tempChangesObj.specCategory = record.specCategory;

        		if(record.changes){
        			tempChangesObj = getTempChangesObj(record, tempChangesObj);
        		}
        		existingSpecs = recordsToBeShown.filter(function(spec, index){
        			if(spec.specNumber === tempChangesObj.specNumber){
        				currentSpecIndex = index;
        				return spec;
        			}
        		});
    			item = { paraCode : tempChangesObj.paraCode, description : tempChangesObj.description, type : tempChangesObj.specCategory, recid : record.recid, specName : tempChangesObj.specName };
        		if(existingSpecs && existingSpecs.length > 0){
        			recordsToBeShown[currentSpecIndex].records.push(item);
        			if(!recordsToBeShown[currentSpecIndex].specName && item.specName){
        				recordsToBeShown[currentSpecIndex].specName = item.specName;
        			}
        		} else {
        			numOfSpecSections++;
        			recordsToBeShown.push({specNumber : tempChangesObj.specNumber, specName : tempChangesObj.specName, records : [item]});
        		}
        	}
        	vm.showConfirmPopover = numOfSpecSections>1?true:false;
        	return recordsToBeShown;
        }

        function recordSelected(recid){
        	var targetRecord = {}, targetIndex = -1;
        	var currentRecordLst = $scope.recordsData.filter(function(data, index){
        		if(data.recid === recid){
        			targetIndex = index;
        			return data;
        		}
        	});
        	if(currentRecordLst && currentRecordLst.length > 0){
        		targetRecord = currentRecordLst[0];
        		vm.selectedRecord = targetRecord;
        	} else {
        		FlashService.Error("Unable to get the target record.");
        		return;
        	}
        	vm.targetIndex = targetIndex;
        }

        function mergeRecords(targetIndex){
        	var targetRecord = vm.selectedRecord, targetDescription = "";
        	var recordDataCopy = angular.copy(recordData);
            var description = recordDataCopy.map(function (elem) {
                if (targetRecord.recid != elem.recid) {
                    elem.style = "background-color: #FAEDED!important;text-decoration: line-through;";
                    elem.isMergeDeletedRecord = true;
                    elem.targetSerialNumber = targetRecord.serialNumber;
                    if (!elem.changes)
                        elem.changes = {};
                    elem.changes.targetRecId = targetRecord.recid;
                    elem.editable = false;
                    if(elem.changes[vm.submittalProductVar]){
            			description = elem.changes[vm.submittalProductVar];
            		} else {
            			description = elem[vm.submittalProductVar];
            		}
                    var paraCode = elem.paraCode?elem.paraCode:'';
                    return paraCode + ' ' + description;
                } else {
                    elem.style = "background-color: #FEECD1!important";
                    elem.isMergeTargetRecord = true;
                }
            }).join("\n\n");

            if (!recordDataCopy[targetIndex][vm.submittalProductVar])
                recordDataCopy[targetIndex][vm.submittalProductVar] = "";

            if (!recordDataCopy[targetIndex].paraCode)
                recordDataCopy[targetIndex].paraCode = "";


            if(recordDataCopy[targetIndex].changes && recordDataCopy[targetIndex].changes[vm.submittalProductVar]){
            	targetDescription = recordDataCopy[targetIndex].changes[vm.submittalProductVar];
    		} else {
    			targetDescription = recordDataCopy[targetIndex][vm.submittalProductVar];
    		}

            vm.mappingObj[vm.submittalProductVar] = angular.copy(targetDescription);
            if(recordDataCopy[targetIndex].changes){
            	vm.mappingObj = getTempChangesObj(recordDataCopy[targetIndex], vm.mappingObj);
    		}

            var descriptionToShow = targetDescription + "\n\n" + description.trim();
            vm.description = angular.copy(descriptionToShow);
            vm.description = SanitizationService.decode(vm.description);
            vm.descriptionEdited = angular.copy(vm.description);
            recordDataCopy[targetIndex][vm.submittalProductVar] = vm.description;

            if (!recordDataCopy[targetIndex].changes)
                recordDataCopy[targetIndex].changes = {};

            recordDataCopy[targetIndex].changes[vm.submittalProductVar] = recordDataCopy[targetIndex][vm.submittalProductVar];
            recordDataCopy[targetIndex].changes.paraCode = recordDataCopy[targetIndex].paraCode;

            vm.finalRecords = recordDataCopy;
        }

        function gotoIntroScreen(){
        	vm.selectedRecord = null;
        	vm.description = "";
        	vm.finalRecords = null;
        	vm.Step = 0;
        }

        function backButtonClicked(){
        	if(vm.Step === 2){
        		vm.Step = 1;
        	} else if(vm.Step === 1) {
        		vm.Step = 0;
        	} else {
        		//Oh god which step you are in
        		console.log('Unable to find required step');
        	}
        	vm.selectedRecord = null;
        	vm.description = "";
        	vm.finalRecords = null;
        	vm.RecordSelectedFlag = false;
        }

        $scope.recordDataCopy = {};

        $scope.myPopover = {
            templateUrl: 'editdescriptionpopover.html',
            isOpen: false,
            close: function (i) {
                $scope.myPopover.isOpen = false;
                vm.descriptionEdited = vm.description;
            },
            saveDescription: function (i) {
              vm.description = vm.descriptionEdited;
              vm.finalRecords = vm.finalRecords.map(function(item) {
                if(item.changes[vm.submittalProductVar]) {
                  item.changes[vm.submittalProductVar] = vm.description;
                }
                return item;
              });
              $scope.myPopover.isOpen = false;
            }
        }

        $scope.mergeButtonClicked = function(){
        	vm.Step = 2;
        	mergeRecords(vm.targetIndex);
        }

        $scope.Confirm = function () {
        	$uibModalInstance.close({ records: vm.finalRecords, targetRecordRecId: vm.selectedRecord.recid, mappingObj : vm.mappingObj });
        };

        $scope.Cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };
})();
