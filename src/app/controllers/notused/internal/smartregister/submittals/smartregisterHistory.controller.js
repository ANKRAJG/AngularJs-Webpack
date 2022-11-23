(function() {
    'use strict';

    angular.module('EventsApp').controller('SmartRegisterHistoryController',
    		SmartRegisterHistoryController);

    SmartRegisterHistoryController.$inject = ['AuthenticationService', 'EventService', 'historySerialNumber', 'SmartRegisterService',
        'FlashService', '$scope', '$uibModal', 'MAINURL', '$rootScope', 'ProjectService','$linq', '$route', 'SanitizationService'];

    function SmartRegisterHistoryController(AuthenticationService, EventService, historySerialNumber, SmartRegisterService,
        FlashService, $scope, $uibModal, MAINURL, $rootScope, ProjectService, $linq, $route, SanitizationService) {

        var vm = this;
        vm.GetAllSmartRegisterEvents = GetAllSmartRegisterEvents;
        vm.revertDeletedChange = revertDeletedChange;
        vm.selectedTab = '7';
        vm.resetSerialNumberFlag = false;
        vm.downloadEventsFile = downloadEventsFile;

        (function initController() {
            LoadUserDetails();
            LoadProjects();
        })();

        function LoadUserDetails() {
            vm.user = AuthenticationService.GetUserInfo();
        }

        function revertDeletedChange(row) {
            	var message = "Are you sure you want to revert the record into the Smart Register?";
            	var modalInstance = $uibModal
    			.open({
    			    animation: true,
    			    templateUrl: MAINURL + 'views/support/support.enterpriseconfirmation.view.html',
    			    controller: 'ConfirmUpgradeToEnterprise',
    			    backdrop: 'static',
    			    resolve: {
    			        items: { message: message }
    			    }
    			});

              modalInstance.result.then(function (data) {
            	    revertDeletedRow(row);
                }, function () {
             });
        }

        vm.closeSlide = function() {
          $scope.$hide();
          if(vm.ifDeleteEventReverted) {
            $route.reload();
          }
        }

        function revertDeletedRow(row) {
        	//TODO - Need to reconstruct the below calling method getFilteredRecordObject fields inorder to give all the required fields, until then we will just delete extra fields
        	/*var rows = getFilteredRecordObject([row.oldRecord]);
        	row.oldRecord = rows[0];*/

        	delete row.oldRecord.style;
        	delete row.oldRecord.isNewRecord;
        	delete row.oldRecord.sourceRecId;

        	EventService.RevertSmartRegisterEvent(vm.selectedProject.projectId, vm.selectedVersion.versionId, row.eventId ,row.oldRecord, function (response) {
                if (response.success) {
                	  row.isEventReverted = 1;
                    FlashService.Success('Successfully reverted the changes');
                    vm.ifDeleteEventReverted = true;
                    GetAllSmartRegisterEvents();
                } else {
                    FlashService.Error(response.message);
                }
            });
        }

        function LoadProjects(callback) {
            vm.dataLoading = "";
            vm.projects = AuthenticationService.GetUserProjects();
            if (vm.projects.length == 0) {
                vm.NoProjects = true;
            } else {
                vm.NoProjects = false;
                vm.dataLoading = false;
                GetSelectedProject();
            }
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
					GetAllSmartRegisterEvents();
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

        vm.viewDetailsColumns = ['specNumber', 'specName', 'paraCode', 'submittalsHeading', 'specCategory', 'submittalDescription', 'targetDate',
                                  'subContractor', 'userNotes', 'dateIssued', 'specCategoryGroup', 'projectSummaryGroup']
        function searchForEvents(searchSLNo) {
          vm.openHistoryDetail = {};
          if(searchSLNo || (vm.searchText && vm.searchText.startsWith('#') && /^\d+$/.test(vm.searchText.substr(1)))) {
              vm.searchText = searchSLNo ? searchSLNo.toString() : vm.searchText;
              vm.filteredChangeSetList = vm.changeSetList.filter(function(item) {
                if((item.serialNumber && item.serialNumber === vm.searchText) ||
                  (item.targetSerialNumber && item.targetSerialNumber === vm.searchText)) {
                  return true;
                }
                if(vm.resetSerialNumberFlag && item.action === 'ResetSerialNumber') {
                	return ((('#' + item.from) === vm.searchText) || (('#' + item.to) === vm.searchText));
                }
                return false;
              });
          }
          else {
              vm.lowerText = vm.searchText.toString().toLowerCase();
              var fieldsToSearch = ['createTime', 'userName', 'fullSentence'];
              vm.filteredChangeSetList = vm.changeSetList.filter(function(item) {
                var found = false;
                var oldNewArrays = [];
                if(item.oldRecord) { oldNewArrays.push(item.oldRecord); }
                if(item.newRecord) { oldNewArrays.push(item.newRecord); }
                if(item.action !== 'ResetSerialNumber' || (vm.resetSerialNumberFlag && item.action === 'ResetSerialNumber')) {
                  for(var i=0; i<fieldsToSearch.length; i++) {
                    if(item[fieldsToSearch[i]] && item[fieldsToSearch[i]].toLowerCase().indexOf(vm.lowerText) > -1) {
                      return true;
                    }
                  }
                }

                for (var i=0; i<oldNewArrays.length; i++) {
                  for(var key in oldNewArrays[i]) {
                    if(key === 'smartColumnValues') {
                      // search for custom columns name and value in both old and new record
                      for(var innerKey in oldNewArrays[i][key]) {
                        if(oldNewArrays[i][key][innerKey] && oldNewArrays[i][key][innerKey]['value']) {
                          // Condition, just to save the value in a variable
                          var labelValue = oldNewArrays[i][key][innerKey]['value'].toString().toLowerCase();
                        }
                        if(labelValue && labelValue.indexOf(vm.lowerText) > -1 ) {
                            found = true;
                            break;
                        }
                      }
                    }
                    else if(key === 'specNumber') {
                      // search for spec number in both old and new record
                      if(oldNewArrays[i][key]) {
                        var text = vm.lowerText.replace(/\W/g,'');
                        var specNo = oldNewArrays[i][key].toString().toLowerCase().replace(/\s/g,'');
                        if(specNo.indexOf(text) > -1) {
                            found = true;
                            break;
                        }
                      }
                    }
                    else {
                      // search for all fields in both old and new record
                      if(vm.viewDetailsColumns.indexOf(key) > -1) {
                        if(oldNewArrays[i][key]) {
                          var fieldValue = oldNewArrays[i][key].toString().toLowerCase();
                          if(fieldValue.indexOf(vm.lowerText) > -1) {
                              found = true;
                              break;
                          }
                        }
                      }
                    }
                  }
                  if(found) {
                    break;
                  }
                }
                return found ? true : false;
              });
          }
        }

        vm.searchEvents = function(searchSLNo) {
            vm.clickedThroughSerialNumber = searchSLNo ? true : false;
            if(vm.selectedTab !== 'all') {
              vm.selectedTab = 'all';
              vm.searchText = searchSLNo ? searchSLNo : vm.searchText;
              GetAllSmartRegisterEvents();
            } else {
              searchForEvents(searchSLNo);
            }
        }

        vm.filterBySerialNumber = function() {
            vm.openHistoryDetail = {};
            if(vm.resetSerialNumberFlag) {
              vm.changeSetList = angular.copy(vm.originalChangeSetList);
            } else {
              vm.changeSetList = vm.originalChangeSetList.filter(function(item) {
                return item.action !== 'ResetSerialNumber';
              });
            }
            vm.filteredChangeSetList = angular.copy(vm.changeSetList);
            if(vm.searchText) {
              vm.searchEvents();
            }
        }

        vm.changeTab = function(value) {
            vm.openHistoryDetail = {};
            vm.selectedTab = value;
            if(value !== 'all') {
              historySerialNumber = '';
              vm.searchText = '';
            }
            GetAllSmartRegisterEvents();
        }

        function GetAllSmartRegisterEvents() {
            vm.filteredChangeSetList = null;
            if(historySerialNumber) {
              vm.selectedTab = 'all';
            }
            vm.noOfDays = (vm.selectedTab === 'all') ? null : parseInt(vm.selectedTab);
            vm.dataLoading = "";
            EventService.GetSmartRegisterEvents(vm.selectedProject.projectId, vm.selectedVersion.versionId, vm.noOfDays, function(response) {
                if (response.success) {
                	if(response.data.length > 0) {
                		 vm.smartRegisterEvents = response.data;
                		 vm.smartRegisterEventsCopy = angular.copy(vm.smartRegisterEvents);
                		 prepareObjectForChangeSet(vm.smartRegisterEventsCopy);
                		 vm.noSmartRegisterEvents = false;
                		 $scope.isEventsAvailable = true;
                     vm.noResultsFound = false;
                	}
                	else {
                     vm.changeSetList = [];
                     vm.originalChangeSetList = [];
                     vm.filteredChangeSetList = [];
                     vm.noResultsFound = true;
                		 vm.noSmartRegisterEvents = true;
                	}
                } else {
                    FlashService.Error(response.message);
                }
                vm.dataLoading = false;
            });
        }

        function prepareObjectForChangeSet(records) {
        	  vm.changeSetList = [];
            vm.filteredChangeSetList = [];
            for (var index = 0; index < records.length; index++) {
                var changeSetObject = {};
                var decodedChangeSet = SanitizationService.decode(records[index].changeSet);
                if(records[index].action !== 'ResetSerialNumber' && records[index].action !== 'Export'
                		&& records[index].action !== 'VersionReplaced' && records[index].action !== 'PlanVersionReplaced'
                		&& records[index].action !== 'PlanRun') {
                    changeSetObject = JSON.parse(decodedChangeSet);
                    changeSetObject.action = getDisplayNameForAction(records[index].action);
                    if(changeSetObject.oldRecord) {
                        changeSetObject.serialNumber = '#' + changeSetObject.oldRecord.serialNumber;
                    }
                    if(changeSetObject.newRecord) {
                        changeSetObject.serialNumber = '#' + changeSetObject.newRecord.serialNumber;
                    }
                    setEventFields(changeSetObject);
                    changeSetObject.createTime = moment(records[index].createTime).format("D MMM YYYY HH:mm");
                    changeSetObject.userName = records[index].userName;
                    changeSetObject.userEmail = records[index].userEmail;
                    changeSetObject.eventId = records[index].eventId;
                    changeSetObject.isEventReverted = records[index].isEventReverted;
                    vm.changeSetList.push(changeSetObject);
                }
                else if(records[index].action === 'ResetSerialNumber') {
                    populateChangeSetListForResetSerialNumberActions(changeSetObject, JSON.parse(decodedChangeSet), records[index]);
                } else if (records[index].action === 'VersionReplaced' || records[index].action === 'PlanVersionReplaced' || records[index].action === 'PlanRun') {
                	changeSetObject.action = records[index].action;
                	changeSetObject.fullSentence = decodedChangeSet;
                	changeSetObject.createTime = moment(records[index].createTime).format("D MMM YYYY HH:mm");
                    changeSetObject.userName = records[index].userName;
                    changeSetObject.userEmail = records[index].userEmail;
                    changeSetObject.eventId = records[index].eventId;
                    changeSetObject.isEventReverted = records[index].isEventReverted;
                    vm.changeSetList.push(changeSetObject);
                } else {
                    var objectChangeSet = JSON.parse(decodedChangeSet);
                    changeSetObject.action = getDisplayNameForAction(records[index].action);
                    changeSetObject.fullSentence = 'Exported submittals to ' + objectChangeSet.exportSystem;
                    changeSetObject.exportSystem = objectChangeSet.exportSystem;
                    changeSetObject.createTime = moment(records[index].createTime).format("D MMM YYYY HH:mm");
                    changeSetObject.userName = records[index].userName;
                    changeSetObject.userEmail = records[index].userEmail;
                    changeSetObject.eventId = records[index].eventId;
                    changeSetObject.isEventReverted = records[index].isEventReverted;
                    vm.changeSetList.push(changeSetObject);
                }
            }
            vm.originalChangeSetList = angular.copy(vm.changeSetList);
            vm.filterBySerialNumber();
            checkWhetherToSearch();
        }

        function populateChangeSetListForResetSerialNumberActions(changeSetObject, resetedSerialNumbers, record) {
            for(var key in resetedSerialNumbers) {
                var obj = {};
                obj.action = record.action;
                obj.from = key;
                obj.to = resetedSerialNumbers[key];
                obj.fullSentence = 'Reset Old #' + obj.from + ' to New #' + obj.to + '.';
                obj.createTime = moment(record.createTime).format("D MMM YYYY HH:mm");
                obj.userName = record.userName;
                obj.userEmail = record.userEmail;
                obj.eventId = record.eventId;
                obj.isEventReverted = record.isEventReverted;
                vm.changeSetList.push(obj);
            }
        }

        function checkWhetherToSearch() {
          if(historySerialNumber || (vm.searchText && vm.selectedTab === 'all')) {
            vm.clickedThroughSerialNumber ? vm.searchEvents(vm.searchText) : vm.searchEvents(historySerialNumber);
          }
        }

        var smartRegisterColumnsMap = {
            serialNumber: 'S. No',
            specNumber: 'Spec Section',
            specName: 'Spec Name',
            paraCode: 'Spec sub section',
            submittalsHeading: 'Sub Section Heading',
            specCategory: 'Submittal Type',
            submittalDescription: 'Submittal Description',
            targetDate: 'Target Date',
            subContractor: 'Subcontractor',
            userNotes: 'User Notes',
            dateIssued: 'Date Issued',
            specCategoryGroup: 'Submittal Type Group',
            projectSummaryGroup: 'Submittal Group'
        };

        function setEventFields(changeSetObject) {
            var string = '';
            if(changeSetObject.action === 'Changed' || changeSetObject.action === 'Replaced') {
                for(var key in smartRegisterColumnsMap) {
                  if(changeSetObject.newRecord[key] !== changeSetObject.oldRecord[key]) {
                    string = string + smartRegisterColumnsMap[key] + ', ';
                  }
                }
                for(var key in changeSetObject.newRecord.smartColumnValues) {
                  if(changeSetObject.newRecord.smartColumnValues[key].value !== (changeSetObject.oldRecord.smartColumnValues && changeSetObject.oldRecord.smartColumnValues[key].value)) {
                    string = string + changeSetObject.newRecord.smartColumnValues[key].label + ', ';
                  }
                }
                changeSetObject.updatedFields = string.replace(/,\s*$/, "");
                updateSpecsDetails(changeSetObject);
                if(changeSetObject.action === 'Changed') {
                  changeSetObject.fullSentence = 'Changed ' + changeSetObject.updatedFields + ' for submittal ' + changeSetObject.serialNumber + ', ' + changeSetObject.threeColumnValues;
                } else {
                  if(changeSetObject.sourceRecordVersionName) {
                    changeSetObject.serialNumber = '#' + changeSetObject.sourceRecordSerialNumber;
                    changeSetObject.targetSerialNumber = '#' + changeSetObject.newRecord.serialNumber;
                    changeSetObject.fullSentence = 'Replaced submittal ' + changeSetObject.targetSerialNumber + ', ' + changeSetObject.threeColumnValues + ' with submittal ' + changeSetObject.serialNumber + ' from Version- ' + changeSetObject.sourceRecordVersionName;
                  } else {
                    changeSetObject.serialNumber = changeSetObject.oldRecord ? ('#' + changeSetObject.oldRecord.serialNumber) : '';
                    changeSetObject.targetSerialNumber = '#' + changeSetObject.newRecord.serialNumber;
                    changeSetObject.fullSentence = 'Replaced submittal ' + changeSetObject.targetSerialNumber + ', ' + changeSetObject.threeColumnValues + ' with submittal ' + changeSetObject.serialNumber + ' from Version- ' + changeSetObject.oldRecord.source;
                  }
                }
            }
            else if(changeSetObject.action === 'MergeDeleted') {
                if(changeSetObject.oldRecord && changeSetObject.newRecord) {
                    changeSetObject.serialNumber = '#' + changeSetObject.oldRecord.serialNumber;
                    changeSetObject.targetSerialNumber = '#' + changeSetObject.newRecord.serialNumber;
                    updateSpecsDetails(changeSetObject);
                    changeSetObject.fullSentence = 'Deleted submittal ' + changeSetObject.serialNumber + ', after Merging it with submittal ' + changeSetObject.targetSerialNumber + ', ' + changeSetObject.threeColumnValues;
                } else {
                  // this is just to keep backward compatibility
                  changeSetObject.action = 'Deleted';
                  changeSetObject.previousAction = 'MergeDeleted';
                  updateSpecsDetails(changeSetObject);
                  changeSetObject.fullSentence = 'Deleted submittal ' + changeSetObject.serialNumber + ', ' + changeSetObject.threeColumnValues;
                }
            }
            else if(changeSetObject.action === 'Copied') {
              updateSpecsDetails(changeSetObject);
              if(changeSetObject.oldRecord) {
                // this is just to keep backward compatibility
                changeSetObject.serialNumber = '#' + changeSetObject.oldRecord.serialNumber;
                changeSetObject.targetSerialNumber = '#' + changeSetObject.newRecord.serialNumber;
                if(changeSetObject.oldRecord.source === vm.selectedVersion.name) {
                  changeSetObject.fullSentence = 'Copied submittal ' + changeSetObject.serialNumber + ', ' + changeSetObject.threeColumnValues + ' to Add a new submittal ' + changeSetObject.targetSerialNumber;
                } else {
                  changeSetObject.fullSentence = 'Copied submittal ' + changeSetObject.serialNumber + ', ' + changeSetObject.threeColumnValues + ' from Version- ' + changeSetObject.oldRecord.source + ' to Add a new submittal ' + changeSetObject.targetSerialNumber;
                }
              } else {
                if(changeSetObject.sourceRecordSerialNumber) {
                  changeSetObject.serialNumber = '#' + changeSetObject.sourceRecordSerialNumber;
                  changeSetObject.targetSerialNumber = '#' + changeSetObject.newRecord.serialNumber;
                  changeSetObject.fullSentence = 'Copied submittal ' + changeSetObject.serialNumber + ', ' + changeSetObject.threeColumnValues + ' to Add a new submittal ' + changeSetObject.targetSerialNumber;
                } else {
                  // this is just to keep backward compatibility
                  changeSetObject.fullSentence = 'Added new submittal ' + changeSetObject.serialNumber + ', ' + changeSetObject.threeColumnValues + ' after copying from an existing submittal.';
                }
              }
            } else if(changeSetObject.action === 'CrossVersionCopy') {
              updateSpecsDetails(changeSetObject);
              changeSetObject.serialNumber = '#' + changeSetObject.sourceRecordSerialNumber;
              changeSetObject.targetSerialNumber = '#' + changeSetObject.newRecord.serialNumber;
              changeSetObject.fullSentence = 'Copied submittal ' + changeSetObject.serialNumber + ', ' + changeSetObject.threeColumnValues + ' from Version- ' + changeSetObject.sourceRecordVersionName + ' to Add a new submittal ' + changeSetObject.targetSerialNumber;
			  }
            else if (changeSetObject.action === 'SpecSectionDeleted') {
				var specSection = "";
				if (changeSetObject.specCode && changeSetObject.specName) {
					specSection = changeSetObject.specCode + " - "
							+ changeSetObject.specName;
				} else {
					if(changeSetObject.specCode && !changeSetObject.specName){
						specSection = changeSetObject.specCode;
					}
					else if(changeSetObject.specName && !changeSetObject.specCode){
						specSection = changeSetObject.specName;
					}
				}
				changeSetObject.fullSentence = 'Deleted spec section '
						+ specSection;
			}  else {
                // For Case of Add, Delete and Reverted
                updateSpecsDetails(changeSetObject);
                if(changeSetObject.action === 'Reverted') {
                  changeSetObject.serialNumber = changeSetObject.oldRecord ? ('#' + changeSetObject.oldRecord.serialNumber) : '';
                  changeSetObject.targetSerialNumber = '#' + changeSetObject.newRecord.serialNumber;
                  changeSetObject.fullSentence = changeSetObject.action + ' submittal ' + changeSetObject.serialNumber + ', ' + changeSetObject.threeColumnValues + ' to Add a submittal ' + changeSetObject.targetSerialNumber + '.';
                } else {
                  changeSetObject.fullSentence = changeSetObject.action + (changeSetObject.action === 'Added' ? ' new submittal ' : ' submittal ') + changeSetObject.serialNumber + ', ' + changeSetObject.threeColumnValues;
                }
            }
        }

        function updateSpecsDetails(changeSetObject) {
            var record = changeSetObject.newRecord ? changeSetObject.newRecord : changeSetObject.oldRecord;
            changeSetObject.threeColumnValues = record.specNumber + (record.specNumber ? ' - ' : '') + record.specName + (record.specName ? ', ' : '') + record.specCategory;
        }


		 function getDisplayNameForAction(action) {
        	  switch (action) {
          		  case "Update": {
          			  return "Changed";
          	      }
                  default: {
          				return action;
          		  }
              }
		}

        function containsObject(list, property, val) {
            for (var i = 0; i < list.length; i++) {
                if (list[i][property] === val) {
                    return true;
                }
            }
            return false;
        }

        vm.showHistoryDetails = function(row) {
            if(vm.openHistoryDetail && vm.openHistoryDetail[row.eventId]) {
              vm.openHistoryDetail[row.eventId] = !vm.openHistoryDetail[row.eventId];
            } else {
              vm.openHistoryDetail = {};
              vm.openHistoryDetail[row.eventId] = true;
            }
        }

        function downloadEventsFile(fileType) {
        	var noOfDays = vm.noOfDays == null ? 0 : vm.noOfDays;
        	SmartRegisterService.historyDownload(vm.selectedProject.projectId, vm.selectedVersion.versionId, noOfDays, vm.resetSerialNumberFlag, fileType, function(response){
        		if(response.success) {
        			var fileType = '24';
        			SmartRegisterService.downLoadFile(vm.selectedProject.projectId, vm.selectedVersion.versionId, fileType, function(response){
                        FlashService.Success(response.message);
                        vm.dataLoading = false;
                      }, false, false);
        		} else {
                    FlashService.Error(response.message);
                }
        	});
        }

    }

})();

function historyScrollListener() {
    setTimeout(function() {
        var calculatedHistoryHeight = window.innerHeight - 130;
        var historyHeight = $('#history-body').height();
        if(historyHeight > calculatedHistoryHeight){
            $('.table-last').addClass('withscroll');
        }
        else{
            $('.table-last').removeClass('withscroll');
        }
    }, 10);
}
