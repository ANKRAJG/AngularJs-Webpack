(function () {
    'use strict';

    angular.module('EventsApp').controller('PypeAIGenerationController', PypeAIGenerationController);

    PypeAIGenerationController.$inject = ['$scope', '$uibModalInstance', 'items', 'PlanViewService', 'UtilService', 'FlashService', '$timeout'];
    function PypeAIGenerationController($scope, $uibModalInstance, items, PlanViewService, UtilService, FlashService, $timeout) {

    	$scope.hideDontShowChkbx = items.hideDontShowChkbx;
    	$scope.dontShowIntroScreen = items.dontShowIntroScreen;
    	$scope.project = items.project;
    	$scope.version = items.version;
    	$scope.recommendedSubsNoSort = items.recs;
    	$scope.keepLoderMinTime = !items.ShowPypeAICheckbox;

    	(function initController() {
    		//$scope.step = 2;return;
    		if ($scope.dontShowIntroScreen){
    			$scope.step = 2;
            	getRecommendedSubmittals(function(){
            		$scope.step = 3;
            	});
        	} else {
        		$scope.step = 1;
        		$scope.dontShowMeAgain = false;
        	}
    	})();

        $scope.Cancel = function (step) {
        	var flag = step == 3 ? $scope.dontShowMeAgain : false;
            $uibModalInstance.dismiss({dontShowFlag : flag, submittals: $scope.recommendedSubsNoSort, proceed: $scope.step > 1, cancelClick : true});
        };

        $scope.Continue = function () {
            $uibModalInstance.close({dontShowFlag : $scope.dontShowMeAgain});
        };

        $scope.showSpec = function(sub, $index){
        	return $index == 0 || $scope.recommendedSubs[$index - 1].specNumber !== sub.specNumber;
        }

        $scope.showClicked = function(sub){
        	$uibModalInstance.close({dontShowFlag : $scope.dontShowMeAgain, submittal: sub, submittals: $scope.recommendedSubsNoSort});
        }

        $scope.showMeClicked = function(step){
        	var flag = step == 3 ? $scope.dontShowMeAgain : false;
        	$uibModalInstance.dismiss({dontShowFlag : flag, submittals: $scope.recommendedSubsNoSort, proceed: $scope.step > 1, newSubsCount: $scope.recommendedSubs.length});
        }

        $scope.goToStep2 = function(){
        	$scope.step = 2;
        /*------------- UNCOMMENT THIS -------------  */
        	getRecommendedSubmittals(function() {
        		$scope.step = 3;
        	});
        }

        $scope.checkboxChanged = function(flag){
        	$scope.dontShowMeAgain = flag;
        }

        $scope.getGroupCount = function(field, item){
        	var count = 0;
        	if (item){
        		$scope.recommendedSubs.forEach(function(submittal){
            		if (submittal[field] === item[field]){
            			count++;
            		}
            	});
        	} else {
        		count = $scope.recommendedSubs.length;
        	}
        	return count;
        }

        $scope.onVideEnd = function(){
        	var video = $('#pypeai-loader-video')[0];
        	//Restart the video from 7 seconds which will repeat Organizing Recommendations part in video
        	if ($scope.preventReplay) return;
        	video.currentTime = 7;
        	video.play();
        }

        function getRecommendedSubmittals(callback) {
        	var startTime = new Date(), minTimeInMilliSec = 15000;
        	$scope.dataLoading = true;
        	PlanViewService.GetRecommendedSubmittals($scope.project.projectId, $scope.version.versionId, function(response) {
				if (response && response.success && response.data) {
					var endTime = new Date();
					//Find the API request time and remove it from mintime which is 15sec
					var remTime = minTimeInMilliSec - (endTime - startTime);
					//Following if condition will make sure user waits for 15sec if he is running AI for the first time so that he can see the loader
					if ($scope.keepLoderMinTime && remTime > 0){
						$timeout(function(){
							$scope.preventReplay = true;
							var oldNewSubs = separateOldNNewSubmittalsFrmResponse(response.data);
							$scope.recommendedSubsNoSort = oldNewSubs.newSubs.concat(oldNewSubs.oldSubs);//response.data;
		            		$scope.recommendedSubs = angular.copy(oldNewSubs.newSubs);
				            //$scope.recommendedSubs.sort(UtilService.DynamicSort('specNumber'));
		            		$scope.recommendedSubs.sort(UtilService.DynamicCustomSpecSort());
				            $scope.dataLoading = false;
				            if (callback) callback();
						}, remTime);
					} else {
						$scope.preventReplay = true;
						var oldNewSubs = separateOldNNewSubmittalsFrmResponse(response.data);
						$scope.recommendedSubsNoSort = oldNewSubs.newSubs.concat(oldNewSubs.oldSubs);//response.data;
		            	$scope.recommendedSubs = angular.copy(oldNewSubs.newSubs);
			            //$scope.recommendedSubs.sort(UtilService.DynamicSort('specNumber'));
		            	$scope.recommendedSubs.sort(UtilService.DynamicCustomSpecSort());
			            $scope.dataLoading = false;
			            if (callback) callback();
					}

				} else {
					$scope.preventReplay = true;
					FlashService.Error(response.message ? response.message : 'Problem while getting Suggested Submittals');
					$scope.dataLoading = false;
					if (callback) callback();
				}
			});

        	/*$scope.recommendedSubs = angular.copy($scope.recommendedSubsNoSort);
            $scope.recommendedSubs.sort(UtilService.DynamicSort('specNumber'))*/
        }

        function separateOldNNewSubmittalsFrmResponse(data){
        	var newSubs = [], oldSubs = [];
        	for (var ind = 0; ind < data.length; ind++){
        		if (data[ind].newRecord) {
        			delete data[ind].newRecord;
        			newSubs.push(data[ind]);
        		} else {
        			delete data[ind].newRecord;
        			oldSubs.push(data[ind]);
        		}
        	}
        	return {newSubs: newSubs, oldSubs: oldSubs};
        }

        function getRecommendedSubmittalsFromDummyData(callback){
        	var startTime = new Date(), minTimeInMilliSec = 15000;
        	$scope.dataLoading = true;
        	var response = {
        		    "success": true,
        		    "message": "Successfully got AI sumbmittals update status",
        		    "authToken": null,
        		    "data": [
        		        {
        		            "projectName": "TestDom_003",
        		            "submittalsHeading": "",
        		            "divisionCode": "32",
        		            "divisionName": "Exterior Improvements",
        		            "serialNumber": 1,
        		            "specNumber": "329220",
        		            "specName": "SODDING",
        		            "submittalDescription": "Submit Product Data",
        		            "origSubmittalDescription": null,
        		            "specCategory": "Product Data",
        		            "origSpecCategory": null,
        		            "targetDate": null,
        		            "userNotes": null,
        		            "paraCode": "",
        		            "targetGroup": null,
        		            "pdfPageNumber": 0,
        		            "pdfEndPageNumber": 0,
        		            "pdfLineNumber": 0,
        		            "pdfURL": null,
        		            "specCategoryGroup": "",
        		            "projectSummaryGroup": "",
        		            "submtitalTargetGroup": "",
        		            "projectNumber": null,
        		            "companyName": "Pype Inc.",
        		            "action": "UNCHANGED",
        		            "subContractor": "",
        		            "divisionPDFStartPageNumber": 0,
        		            "isSpecDescNextPage": 0,
        		            "origPDFStartPageNumber": 1,
        		            "specSubmittalNumber": 0,
        		            "specSubmittalNumberGrpBySpecCat": 0,
        		            "specSequenceNumber": 0,
        		            "expanded": false,
        		            "productFlag": false,
        		            "deleteFlag": false,
        		            "submittalCategory": "RecommendedSubmittal",
        		            "recid": 1,
        		            "fields": {},
        		            "dateIssued": null,
        		            "uploadedToProcore": false,
        		            "uploadedToBIM360": false,
        		            "bim360ProjectAndSubmittalID": {},
        		            "procoreProjectAndSubmittalID": {},
        		            "createdDate": null,
        		            "versionName": "7889",
        		            "addendumName": null,
        		            "recordLevel": null,
        		            "confidenceLevel": 0.6,
        		            "deleteActive": false,
        		            "xCoordinate": null,
        		            "yCoordinate": null,
        		            "source": "SUBMITTAL RECOMMENDATION",
        		            "isDrawingsAvailable": false,
        		            "drawingFlag": false,
        		            "drawingSheetName": "",
        		            "drawingSheetNumber": "L-1.2",
        		            "drawingSheetType": "LANDSCAPE",
        		            "drawingFileName": "44881141.pdf",
        		            "drawingPageNumber": 1,
        		            "pageWidth": 2592,
        		            "pageHeight": 1728,
        		            "pageRotation": 0,
        		            "executedThroughOCR": false,
        		            "executedThroughDOM": false,
        		            "submittalSummary": "",
        		            "coordinates": [],
        		            "mergedCoordinates": [
        		                [
        		                    0,
        		                    0,
        		                    0,
        		                    0
        		                ]
        		            ],
        		            "newRecord": true
        		        }
        		    ],
        		    "responseCode": 0
        		};

        	if (response && response.success && response.data) {
				var endTime = new Date();
				//Find the API request time and remove it from mintime which is 15sec
				var remTime = 0;//minTimeInMilliSec - (endTime - startTime);
				//Following if condition will make sure user waits for 15sec if he is running AI for the first time so that he can see the loader
				if ($scope.keepLoderMinTime && remTime > 0){
					$timeout(function(){
						$scope.preventReplay = true;
						var oldNewSubs = separateOldNNewSubmittalsFrmResponse(response.data);
						$scope.recommendedSubsNoSort = oldNewSubs.newSubs.concat(oldNewSubs.oldSubs);//response.data;
			            $scope.recommendedSubs = angular.copy(oldNewSubs.newSubs);
			            //$scope.recommendedSubs.sort(UtilService.DynamicSort('specNumber'));
			            $scope.recommendedSubs.sort(UtilService.DynamicCustomSpecSort());
			            $scope.dataLoading = false;
			            if (callback) callback();
					}, remTime);
				} else {
					$scope.preventReplay = true;
					var oldNewSubs = separateOldNNewSubmittalsFrmResponse(response.data);
					$scope.recommendedSubsNoSort = oldNewSubs.newSubs.concat(oldNewSubs.oldSubs);//response.data;
		            $scope.recommendedSubs = angular.copy(oldNewSubs.newSubs);
		            //$scope.recommendedSubs.sort(UtilService.DynamicSort('specNumber'));
		            $scope.recommendedSubs.sort(UtilService.DynamicCustomSpecSort());
		            $scope.dataLoading = false;
		            if (callback) callback();
				}

			} else {
				$scope.preventReplay = true;
				FlashService.Error(response.message ? response.message : 'Problem while getting Suggested Submittals');
				$scope.dataLoading = false;
				if (callback) callback();
			}
        }
    }
})();
