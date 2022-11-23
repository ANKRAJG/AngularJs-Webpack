(function () {
    'use strict';

    angular.module('EventsApp').controller('CompareVersionController',
			CompareVersionController);

    CompareVersionController.$inject = ['$scope', '$location', 'AuthenticationService', 'ProjectService', '$linq',
            'FlashService', 'SmartRegisterService', '$uibModal', 'MAINURL', '$window', '$timeout', 'ModalService', 'AccService'];
    function CompareVersionController($scope, $location, AuthenticationService, ProjectService, $linq,
            FlashService, SmartRegisterService, $uibModal, MAINURL, $window, $timeout, ModalService, AccService) {

        var vm = this;
        vm.NavigateToSmartRegister = NavigateToSmartRegister;
        vm.VersionChanged = VersionChanged;
        vm.ColumnOneChanged = ColumnOneChanged;
        vm.ColumnTwoChanged = ColumnTwoChanged;
        vm.ColumnThreeChanged = ColumnThreeChanged;
        vm.NumberClicked = NumberClicked;
        vm.DownloadPDF = DownloadPDF;
        vm.DownloadExcelDiff = DownloadExcelDiff;
        vm.CompareDiff = CompareDiff;
        vm.versionDetails = [], vm.versionTempDetails = [];
        var totalSubmittalsLabel = 'Total Submittals';
        vm.accProject = AuthenticationService.GetACCProject();

        vm.chartOptions = {
            responsive: true,
            //animation: false,
            elements: {
                arc: { borderWidth: 0 }
            },
            legend: {
              display: false,
            },
            title: {
              display: false,
              text: '' //Chart.js Doughnut Chart
            },
        };


        (function initController() {
        	vm.colors = ["#1D5186", "#236B79", "#298080", "#2F9976", "#2F9976", "#A9EDA9", "#3BBDA8", "#3BCD53", "#4EDA65", "#7EE04C", "#98E770", "#D0E954", "#E0F380", "#E1E154", "#F1F15A"];

            vm.accProject = AuthenticationService.GetACCProject();
            var accProjectId;
            if(vm.accProject) {
                accProjectId = vm.accProject.id;
            }
            AccService.initialiseACCDetails(accProjectId, function() {
                GetCompanyName();
                vm.projects = [];
                LoadUserDetails();
                vm.pageSize = 5;
                GetSelectedProject();
                vm.loaded = 0;
            });
        })();

        function GetProject() {
            if (vm.selectedProject.versions.length > 1)
                GetChartsData();
            else {
                var items = {};
                items.title = 'Alert';
                items.message = "Comparison requires at least two versions of the specifications. Please upload another version to use the comparison feature.";
                ShowWarningMessagePopup(items);
                vm.dataLoading = false;
            }
        }

        function InitializeDefaultOptions() {

            if (vm.versionDetails.length <= 0) {
                ;
            }
            else {
                vm.versionColumnTwo = vm.versionDetails[0].versionId.toString();
                vm.versionColumnOne = vm.versionDetails[1].versionId.toString();

                vm.ModifiedVersionCharts[1] = vm.ModifiedVersionChartsTemp[0];
                vm.ModifiedVersionCharts[0] = vm.ModifiedVersionChartsTemp[1];
            }
            vm.ModifiedVersionChartsTemp = angular.copy(vm.ModifiedVersionCharts);
        }

        function NavigateToSmartRegister () {
	        var accProject = AuthenticationService.GetACCProject();
            $location.path('/smartregister/projects/' + accProject.id);
        }

        function ModifyChart() {
            vm.ModifiedVersionCharts = [];
            for (var i = 0; i < vm.versionDetails.length; i++) {
                var chartsData = [], versionData = {}, totalSubmittals = 0;
                versionData.versionId = vm.versionDetails[i].versionId;
                versionData.versionName = vm.versionDetails[i].versionName;
                for (var j = 0, labelIndex = 0; j < vm.labels.length; j++) {

                    if (vm.versionDetails[i].chart == null || vm.versionDetails[i].chart.data.length <= 0) {
                        ;
                    }

                    else if (vm.versionDetails[i].chart.labels[labelIndex]
                            && vm.versionDetails[i].chart.labels.indexOf(vm.labels[j]) !== -1) {
                        chartsData.push({ 'SubmittalHeading': vm.labels[j], 'SubmittalValue': vm.versionDetails[i].chart.data[labelIndex] });
                        totalSubmittals += vm.versionDetails[i].chart.data[labelIndex];
                        labelIndex++;
                    } else
                        chartsData.push({ 'SubmittalHeading': vm.labels[j], 'SubmittalValue': 0 });
                }
                if (vm.versionDetails[i].chart != null && vm.versionDetails[i].chart.data.length > 0) {
                    chartsData.unshift({ 'SubmittalHeading': 'Total Submittals', 'SubmittalValue': totalSubmittals });
                }
                else if (vm.versionDetails[i].chart != null && vm.versionDetails[i].versionStatus === 'Failed') {
                    chartsData.unshift({
                        'SubmittalHeading': 'Total Submittals', 'SubmittalValue': "Oops! We encountered an error. \n" +
                                "Please contact Pype support at pypesupport@autodesk.com or give us a call at 1 (855)-910-7137."
                    });
                }
                else {
                    chartsData.unshift({
                        'SubmittalHeading': 'Total Submittals', 'SubmittalValue': "Specs not uploaded yet for this version.\n" +
                                "Please upload specs to see data."
                    });
                }
                versionData.charts = chartsData;
                vm.ModifiedVersionCharts.push(versionData);
            }
            vm.ModifiedVersionChartsTemp = angular.copy(vm.ModifiedVersionCharts);
            vm.labels.unshift(totalSubmittalsLabel);
        }

        function CheckNotStartedVersionsNumber(project) {
            var count = 0;
            for (var i = 0; i < project.versions.length; i++) {
                if (project.versions[i].isSmartRegisterModified) {
                    count++;
                }
            }
            if (count > 1)
                return true;
            return false;
        }

        function ShowWarningMessagePopup(items, dontNavigate) {
            ModalService.showAlertMessage(items).result.then(function (data) {
                if (dontNavigate !== true) $window.history.back();
            });
        }

        function containsObject(list, property, val) {
            for (var i = 0; i < list.length; i++) {
                if (list[i][property] === val) {
                    return true;
                }
            }
            return false;
        }

        function GetSelectedProject() {
            vm.dataLoading = 'Loading... Please wait...';
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
                    GetProject();
                });
            }
        }

        function returnUpdatedProject(projectId, callback) {
            SmartRegisterService.GetProjectById(projectId, function (response) {
                if (response.success) {
                    callback(response.data);
                } else {
                    FlashService.Error(response.message);
                    vm.dataLoading = false;
                }
            });
        }

        function CreateLabels() {
            vm.labels = [];
            vm.versionDetails.forEach(function (ver) {
                if (ver.chart) {
                    ver.chart.labels.forEach(function (lblName) {
                        if (vm.labels.indexOf(lblName) === -1) {
                            vm.labels.push(lblName);
                        }
                    });
                }
            });
            vm.labels.sort();
        }

        function VersionChanged(versionSelected, columnNumber) {
            vm.ModifiedVersionCharts[columnNumber] = vm.ModifiedVersionChartsTemp.filter(function (data) {
                if (data.versionId.toString() === versionSelected) return data;
            });
            vm.ModifiedVersionCharts[columnNumber] = angular.copy(vm.ModifiedVersionCharts[columnNumber][0]);
        }

        function ColumnOneChanged() {
            VersionChanged(vm.versionColumnOne, 0);
        }

        function ColumnTwoChanged() {
            VersionChanged(vm.versionColumnTwo, 1);
        }

        function ColumnThreeChanged() {
            VersionChanged(vm.versionColumnThree, 2);
        }

        function NumberClicked(label, version) {
            if (version.chart.length > 1) {
                AuthenticationService.SetProject(vm.selectedProject);
                var selectedVersion = vm.selectedProject.versions.filter(function (data) {
                    return data.versionId == version.versionId
                })[0];
                AuthenticationService.SetVersion(selectedVersion);
                var existingFilter = AuthenticationService.UpdateFilterDataAccordingToFormat([]), searchData = [];
                if (label === totalSubmittalsLabel) {
                	searchData = [];
                } else {
                    searchData = [
                        { field: 'projectSummaryGroup', caption: 'Project Summary Group', value: [label.toUpperCase()], operator: 'is', type: 'text' }
                    ];
                }
                existingFilter = AuthenticationService.UpdateFilterDataWithNewValuesAndVisibility(existingFilter, searchData);

                AuthenticationService.setSRSourceModuleFilter(['specs', 'plans']);
                AuthenticationService.SetSmartRegisterFilter(existingFilter);
                AuthenticationService.SetShowSaveSmartRegisterFilter(true);
                AuthenticationService.setSmartRegisterType('submittals');
                var accProject = AuthenticationService.GetACCProject();
                $location.path('/smartregister/projects/' + accProject.id).search({param: 'home'});
            }
        }

        function CalculateLimitRows() {
            $scope.limitRows = 2;
        }

        function DownloadPDF(version, fileType) {
            vm.dataLoading = "Downloading... Please wait...";
            SmartRegisterService.downLoadFile(vm.selectedProject.projectId, version.versionId, fileType, function (response) {
                if (response.success) {
                    FlashService.Success(response.message);
                } else {
                    FlashService.Error(response.message);
                }
                vm.dataLoading = false;
            }, false, true);
        }

        function DownloadExcelDiff(firstVersion, secondVersion) {
            var categoryName = "Total Submittals";
            vm.dataLoading = "Exporting Variance Report, please wait...";
            SmartRegisterService.DownLoadExcelDifferencesByCategory(vm.selectedProject.projectId,
					firstVersion.versionId, secondVersion.versionId, categoryName, function (response) {
					    if (response.success) {
					        FlashService.Success(response.message);
					    } else {
					        FlashService.Error(response.message);
					    }
                        vm.dataLoading = false;
					});
        }

        function LoadUserDetails() {
            vm.user = AuthenticationService.GetUserInfo();
        }

        function GetCompanyName() {
            vm.companyInfo = AuthenticationService.GetCompanyInfo();
            vm.companyName = vm.companyInfo.name;
        }

        function CompareDiff(row, versionOne, versionTwo, index) {
            if (versionOne.versionId === versionTwo.versionId)
                FlashService.Error("Please select two different versions.");
            var selectedVersions = [];
            for (var i = 0; i < vm.selectedProject.versions.length; i++) {
                if (vm.selectedProject.versions[i].versionId === parseInt(versionOne.versionId)) {
                    selectedVersions.splice(0, 0, vm.selectedProject.versions[i]);
                }
                else if (vm.selectedProject.versions[i].versionId === parseInt(versionTwo.versionId)) {
                    selectedVersions.splice(1, 0, vm.selectedProject.versions[i]);
                }
            }
            if(versionOne.values && versionOne.values[index] == 0 && versionTwo.values && versionTwo.values[index] == 0) {
				FlashService.Error("Selected versions do not contain data. Please select a different version.");
				return;
			}

            if (selectedVersions[0].status.toUpperCase() !== 'COMPLETED' || selectedVersions[1].status.toUpperCase() !== 'COMPLETED')
                FlashService.Error("Selected versions does not contain data please select completed versions.");
            else {
                var modalInstance2 = $uibModal.open({
                    animation: true,
                    size: 'xl',
                    templateUrl: MAINURL + 'views/smartregister/submittals/compare.smartregister.view.html?version=9.2',
                    controller: 'CompareSmartRegisterController',
                    backdrop: 'static',
                    resolve: {
                        category: function () { return row },
                        project: function () { return vm.selectedProject },
                        versions: function () { return selectedVersions }
                    }
                });
                modalInstance2.result.then(function (data) {}, function () {});
            }
        }


        function GetAllLabels(data) {
            var labels = [];
            angular.forEach(data, function (value, key) {
                if (value.chart)
                    labels = labels.concat(value.chart.labels);
            });
            vm.allLabels = _.sortBy(_.uniq(labels), function (num) { return num; });
        }

        function prepareCanvasChartData(chartLabels, chartData) {
        	 var labels = [], values = [], colors = [];
        	 angular.forEach(vm.allLabels, function (value, key) {
                var index = chartLabels.indexOf(value);
                if (index != -1) {
                	labels.push(value);
                	values.push(chartData[index]);
                	colors.push(vm.colors[index]);
                }  else {
                	labels.push(value);
                	values.push(0);
                	colors.push(vm.colors[0]);
                }
            });
            return {labels: labels, values: values, colors: colors};
        }

        function PreapareChartData(labels, data) {
            angular.forEach(vm.allLabels, function (value, key) {
                var index = labels.indexOf(value);
                if (index != -1)
                    chart.push({ label: value, value: data[index], labelColor: vm.colors[index] });
                else
                    chart.push({ label: value, value: 0, labelColor: vm.colors[0] });
            });
            return chart;
        }

        //This function is to create array having zero's based on the number of labels
        //This array will be useful to show zero's when there  is no data for selected version which is having 'completed' status
        function PrepareZerosArray(chartDataZeros) {
            for (var i = 0; i < vm.allLabels.length; i++) {
                chartDataZeros.push(0);
            }
        }

        $scope.chartClickCallBackCtrlFunction = function (index) {
            CompareDiff(vm.allLabels[index]);
        }

        $scope.legendMouseover = function (index) {
            $timeout(function () {
                $scope.$apply(function () {
                    $scope.hoverItem = index;
                    $scope.highlightChartFunction(index);
                });
            }, 0);
        }

        $scope.legendMouseoverLeft = function (index) {
            $timeout(function () {
                $scope.$apply(function () {
                    $scope.hoverItemLeft = index;
                    //$scope.highlightChartFunctionLeft(index);
                });
            }, 0);
        }

        $scope.legendMouseoverRight = function (index) {
            $timeout(function () {
                $scope.$apply(function () {
                    $scope.hoverItemRight = index;
                    //$scope.highlightChartFunctionRight(index);
                });
            }, 0);
        }

        $scope.chartMouseoverCallBackCtrlFunction = function (index) {
            $timeout(function () {
                $scope.$apply(function () {
                    $scope.hoverItem = index;
                });
            }, 0);
        }

        $scope.setHighlightChartFunctionLeft = function (highlightChartFunction) {
            $scope.highlightChartFunctionLeft = highlightChartFunction;
        };
        $scope.setHighlightChartFunctionRight = function (highlightChartFunction) {
            $scope.highlightChartFunctionRight = highlightChartFunction;
        };

        function PreapareChartData(labels, data) {
            var chart = [];
            angular.forEach(vm.allLabels, function (value, key) {
                var index = labels.indexOf(value);
                if (index != -1)
                    chart.push({ label: value, value: data[index], labelColor: vm.colors[index] });
                else
                    chart.push({ label: value, value: 0, labelColor: vm.colors[index] });
            });
            return chart;
        }

        $scope.LeftSelect = function (data) {
			          if ($scope.secondSelected
					&& ($scope.secondSelected.versionId === data.versionId)) {
				if (vm.versionDetails.length === 2) {
					/*
					 * when the project is having only 2 versions and the user
					 * tries to switch between versions,automatically switch the
					 * versions instead of throwing a error.
					 */
					var temp = $scope.firstSelected;
					$scope.firstSelected = $scope.firstSelectedTemp = data;
					$scope.secondSelected = $scope.secondSelectedTemp = temp;
					AuthenticationService.SetCompareVersionData({
						project : vm.selectedProject,
						firstSelected : $scope.firstSelected,
						secondSelected : $scope.secondSelected
					});
				} else {
					var items = {};
					items.title = 'Alert';
					items.message = 'Version "'
							+ data.versionName
							+ '" is already selected. Please select any other version.';
					ShowWarningMessagePopup(items, true);
					$scope.firstSelectedTemp = $scope.firstSelected;
				}
			} else {
            if (data.status.toLowerCase() === 'completed') {
                $scope.firstSelected = data;
                AuthenticationService.SetCompareVersionData({ project: vm.selectedProject, firstSelected: $scope.firstSelected, secondSelected: $scope.secondSelected });
            }
            else {
                var items = {};
                items.title = 'Alert';
                items.message = "No submittals are generated for this version. Please select a different version to compare.";
                ShowWarningMessagePopup(items, true);
                $scope.firstSelectedTemp = $scope.firstSelected;
            }
          }
        }

        $scope.RightSelect = function (data) {
			          if ($scope.firstSelected
					&& ($scope.firstSelected.versionId === data.versionId)) {
				if (vm.versionDetails.length === 2) {
					/*
					 * when the project is having only 2 versions and the user
					 * tries to switch between versions,automatically switch the
					 * versions instead of throwing a error.
					 */
					var temp = $scope.secondSelected;
					$scope.firstSelected = $scope.firstSelectedTemp = temp;
					$scope.secondSelected = $scope.secondSelectedTemp = data;
					AuthenticationService.SetCompareVersionData({
						project : vm.selectedProject,
						firstSelected : $scope.firstSelected,
						secondSelected : $scope.secondSelected
					});
				} else {
					var items = {};
					items.title = 'Alert';
					items.message = 'Version "'
							+ data.versionName
							+ '" is already selected. Please select any other version.';
					ShowWarningMessagePopup(items, true);
					$scope.secondSelectedTemp = $scope.secondSelected;
				}
			} else {
            if (data.status.toLowerCase() === 'completed') {
                $scope.secondSelected = data;
                AuthenticationService.SetCompareVersionData({ project: vm.selectedProject, firstSelected: $scope.firstSelected, secondSelected: $scope.secondSelected });
            }
            else {
                var items = {};
                items.title = 'Alert';
                items.message = "No submittals are generated for this version. Please select a different version to compare.";
                ShowWarningMessagePopup(items, true);
                $scope.secondSelectedTemp = $scope.secondSelected;
            }
          }
        }

        function GetChartsData() {
            ProjectService.GetAllProjectRelatedCharts(vm.selectedProject.projectId, function (response) {
                if (response.success) {
                    if (response.data) {
                        GetAllLabels(response.data);
                        var data = [], total = 0, chartLabel = [], chartData = [];

                        angular.forEach(response.data, function (value, key) {
                            if (value.chart !== null) {
                                total = value.chart.data.reduce(function (a, b) { return a + b }, 0);
                                chartLabel = value.chart.labels;
                                chartData = value.chart.data;
                            }
                            data.push(
                            {
                                "versionId": value.versionId,
                                "versionName": value.versionName,
                                "totalSubmittals": total,
                                "selected": false,
                                "status": value.versionStatus,
                                "chart": PreapareChartData(chartLabel, chartData),
                                "labels" : prepareCanvasChartData(chartLabel, chartData).labels,
                                "values" : prepareCanvasChartData(chartLabel, chartData).values,
                                "colors" : prepareCanvasChartData(chartLabel, chartData).colors
                            });
                        });
                        $scope.data = data;
                        for (var i = 0; i < $scope.data.length; i++) {
                            if ($scope.data[i].status.toLowerCase() === 'completed') {
                                if ($scope.secondSelected) {
                                    $scope.firstSelected = data[i];
                                    $scope.firstSelectedTemp = data[i];
                                    break;
                                }
                                else {
                                  $scope.secondSelected = data[i];
                                  $scope.secondSelectedTemp = data[i];
                                }
                            }
                        }
                        vm.versionDetails = angular.copy(response.data);
                        vm.versionDetailsUnchanged = angular.copy(vm.versionDetails);
                        CreateLabels();
                        ModifyChart();
                        CalculateLimitRows();
                        InitializeDefaultOptions();
                    }
                } else {
                    vm.versionDetails = [];
                }
                vm.dataLoading = false;
            });
        }

        $scope.chartClickCallBackCtrlFunction = function (index) {
            CompareDiff(vm.allLabels[index]);
        }

        $scope.legendMouseover = function (index) {
            $timeout(function () {
                $scope.$apply(function () {
                    $scope.hoverItem = index;
                    //$scope.highlightChartFunctionLeft(index);
                    //$scope.highlightChartFunctionRight(index);
                });
            }, 0);

        }

        $scope.chartMouseoverCallBackCtrlFunction = function (index) {
            $timeout(function () {
                $scope.$apply(function () {
                    $scope.hoverItem = index;
                });
            }, 0);
        }

        $scope.setHighlightChartFunctionLeft = function (highlightChartFunction) {
            $scope.highlightChartFunctionLeft = highlightChartFunction;
        };
        $scope.setHighlightChartFunctionRight = function (highlightChartFunction) {
            $scope.highlightChartFunctionRight = highlightChartFunction;
        };
    }
})();
