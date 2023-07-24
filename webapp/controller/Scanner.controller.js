sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/BusyIndicator"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageToast, MessageBox, JSONModel,BusyIndicator) {
        "use strict";
        var oScanResultText;
        var oScanResultText1;
        var _garray = [];
        return Controller.extend("idcartonenquiry.zcartonenquiry.controller.Scanner", {
            onInit: function () {
                oScanResultText = this.getView().byId('idHUNumber');
                oScanResultText1 = this.getView().byId('idScanHere');
                this.getView().byId("sampleBarcodeScannerButtonChild").setVisible(false);
            },
            onScanSuccess: function (oEvent) {
                var t = this;
                if (oEvent.getParameter("cancelled")) {
                    MessageToast.show("Scan cancelled");
                } else {
                    if (oEvent.getParameter("text")) {
                        oScanResultText.setValue(oEvent.getParameter("text"));
                        var HUNumber = oEvent.getParameter("text");
                        var id = HUNumber.split("-")[0];
                        var oFilter = new sap.ui.model.Filter('ZhuNumber', 'EQ', id);
                        var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZCODE_SCANNER_VERIFICATION_SRV/");
                        oModel.read("/CodeScannerSet", {
                            filters: [oFilter],
                            success: function (odata) {
                                var oModel1 = new JSONModel();
                                oModel1.setData(odata);
                                t.getView().setModel(oModel1, "ScanData");
                                var audio = new Audio("../audio/beep-08b.mp3");
                                audio.play();
                                const unique = [...new Map(odata.results.map((m) => [m.Matnr, m])).values()];

                                var _HUNumber = unique.find(function (element) {
                                    return element.ZhuNumber === HUNumber;
                                })
                                if (_HUNumber) {
                                    var oModel1 = new JSONModel();
                                    oModel1.setData(unique);
                                    t.getView().setModel(oModel1, "ScanData1");
                                    let TS = [];
                                    for (var i = 0; i < unique.length; i++) {
                                        TS.push(unique[i].Menge);
                                    }
                                    let sum = 0;

                                    for (let i = 0; i < TS.length; i++) {
                                        sum += parseInt(TS[i]);
                                    }
                                    t.byId("idTS").setValue(sum);
                                    t.getView().byId("sampleBarcodeScannerButtonChild").setVisible(true);
                                } else {
                                    var audio = new Audio("../audio/beep-05.mp3");
                                    audio.play();
                                    t.getView().byId("sampleBarcodeScannerButtonChild").setVisible(false);
                                    var warning = "Wrong SKU Number";
                                    MessageBox.warning(warning, {
                                        icon: MessageBox.Icon.warning,
                                        title: "ERROR",
                                        actions: [MessageBox.Action.OK],
                                        emphasizedAction: [MessageBox.Action.OK],
                                        onClose: function () {
                                        }
                                    });
                                }

                                t.getView().byId('idScanHere').setValue();
                                t.byId("idSO").setValue();
                            },
                            error: function (oError) {
                                BusyIndicator.hide();
                                var message = oError;
                                var msg = $(oError.response.body).find('message').first().text();
                                var action = "OK";
                                MessageBox.error(msg, {
        
                                    onClose: function () {
                                        if (action === "OK") {
        
                                        }
                                    }
                                });
                            }
                        })
                    }
                }
            },
            onScanSuccessChild: function (oEvent) {
                var t = this;
                var array1 = t.getView().getModel("ScanData").getData().results;
                var warning = "You Already Scanned this Item!";
                var warning1 = "Wrong SKU Number";
                var success = "success";
                var sData = oEvent.getSource().getModel("ScanData1").getData();
                if (oEvent.getParameter("cancelled")) {
                    MessageToast.show("Scan cancelled");
                } else {
                    if (oEvent.getParameter("text")) {
                        oScanResultText1.setValue(oEvent.getParameter("text"));
                        var KeyID2 = oEvent.getParameter("text");
                        var grid = KeyID2.split("-")[2];

                        var _DataZdNum = array1.find(function (element) {
                            return element.ZdNum === KeyID2;
                        })
                        if (_DataZdNum) {
                            if (_garray.length <= 0) {
                                _garray.push(_DataZdNum);
                            }
                            else {
                                var rdata = _garray.find(function (element) {
                                    return element.ZdNum === KeyID2;
                                })
                                if (rdata) {
                                    var _Data = 'X';
                                } else {
                                    _garray.push(_DataZdNum);
                                }
                            }
                        }
                        else {
                            t.getView().byId('idScanHere').setValue();
                            MessageToast.show("This Item Not Related Our Item");
                        }

                        var _DataZhuNumber = array1.find(function (element) {
                            return element.ZhuNumber === KeyID2;
                        })
                        if (_DataZhuNumber) {
                            var audio = new Audio("../audio/beep-05.mp3");
                            audio.play();
                            var t = this;
                            MessageBox.warning(warning1, {
                                id: "msgbox",
                                icon: MessageBox.Icon.warning,
                                title: "ERROR",
                                actions: [MessageBox.Action.OK],
                                emphasizedAction: [MessageBox.Action.OK],
                                onClose: function (actions) {
                                    // if (actions === "OK") {
                                    //     // sap.ui.getCore().byId("msgbox").close();
                                    // }
                                }
                            });
                        }

                        if (_Data) {
                            var audio = new Audio("../audio/beep-05.mp3");
                            audio.play();
                            MessageBox.warning(warning, {
                                icon: MessageBox.Icon.warning,
                                title: "ERROR",
                                actions: [MessageBox.Action.OK],
                                emphasizedAction: [MessageBox.Action.OK],
                                onClose: function () {
                                }
                            });
                        } else {

                            var rdata1 = _garray.find(function (element) {
                                return element.ZdNum === KeyID2;
                            });
                            if (rdata1) {
                                var rdata2 = sData.find(function (element) {
                                    return element.Zgrid === grid;
                                });
                                if (rdata2) {
                                    rdata2.Zscanned = parseInt(rdata2.Zscanned) + 1;
                                    t.getView().getModel("ScanData1").setData(sData);

                                    var audio = new Audio("../audio/beep-08b.mp3");
                                    audio.play();
                                    MessageBox.success(success, {
                                        icon: MessageBox.Icon.success,
                                        title: "SUCCESS",
                                        actions: [MessageBox.Action.OK],
                                        emphasizedAction: [MessageBox.Action.OK],
                                        onClose: function () {
                                        }
                                    });
                                    let TS = [];
                                    for (var i = 0; i < sData.length; i++) {
                                        TS.push(sData[i].Zscanned);
                                    }
                                    let sum = 0;

                                    for (let i = 0; i < TS.length; i++) {
                                        sum += parseInt(TS[i]);
                                    }
                                    t.byId("idSO").setValue(sum);
                                }
                            }
                        }
                    } else {
                        oScanResultText1.setText('');
                    }
                }
            }
        });
    });